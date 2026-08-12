import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// --- CONFIGURATION MANAGEMENT ---
export const API_CONFIG = {
  BASE_URL: 'https://openweathermap.org',
  API_KEY: import.meta.env.VITE_WEATHER_API_KEY || '8bb16bb5510615456144f052661fbf80', 
  UNITS: 'metric'
};

const STORAGE_KEYS = {
  SAVED_LOCATIONS: 'weather_saved_locations', 
  USER_SETTINGS: 'weather_user_settings'
};

interface WeatherData {
  city: string;
  temperature: number; 
  humidity: number;
  windSpeed: number;
  condition: string;
  iconCode: string;
  hourly: Array<{ time: string; temp: number; icon: string }>;
  daily: Array<{ day: string; temp: number; condition: string; icon: string }>;
}

interface LocalAlert {
  id: string;
  type: string;
  message: string;
}

export const Home: React.FC = () => {
  // --- APPLICATION STATE ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Safe local storage parsers
  const [unit, setUnit] = useState<'C' | 'F'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.unit || 'C';
      } catch { return 'C'; }
    }
    return 'C';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.theme || 'light';
      } catch { return 'light'; }
    }
    return 'light';
  });

  const [savedCities, setSavedCities] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  // --- BULLETPROOF NETWORK COMMUNICATION ENGINE ---
  const fetchWeatherApi = async (paramString: string, isCoords: boolean = false) => {
    setLoading(true);
    setErrorMessage('');
    
    let endpoint = `${API_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(paramString)}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
    
    if (isCoords) {
      const [lat, lon] = paramString.split(',');
      endpoint = `${API_CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Location could not be resolved by the server.');
      }
      
      const data = await response.json();
      
      // Structure check to stop mobile engines from processing empty responses
      if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
        throw new Error('The weather service returned data in an invalid format.');
      }
      
      // TARGET FIRST OBJECT: OpenWeatherMap forecast data lists array item 0
      const currentInfo = data.list[0];

      // ABSOLUTE FIX: Safely targets the inner array [0] element of the 'weather' property
      const formattedData: WeatherData = {
        city: data.city && data.city.name ? data.city.name : 'Current Location',
        temperature: currentInfo.main && currentInfo.main.temp !== undefined ? Math.round(currentInfo.main.temp) : 0,
        humidity: currentInfo.main && currentInfo.main.humidity ? currentInfo.main.humidity : 0,
        windSpeed: currentInfo.wind && currentInfo.wind.speed ? Math.round(currentInfo.wind.speed * 3.6) : 0, 
        condition: currentInfo.weather && currentInfo.weather[0] && currentInfo.weather[0].main ? currentInfo.weather[0].main : 'Clear',
        iconCode: currentInfo.weather && currentInfo.weather[0] && currentInfo.weather[0].icon ? currentInfo.weather[0].icon : '01d',
        
        // Maps immediate 4 forecast updates safely using index targeting [0]
        hourly: data.list.slice(0, 4).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: item.main && item.main.temp !== undefined ? Math.round(item.main.temp) : 0,
          icon: item.weather && item.weather[0] && item.weather[0].icon ? item.weather[0].icon : '01d'
        })),
        
        // Filters noon intervals safely (skipping every 8 items for distinct days)
        daily: data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 4).map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          temp: item.main && item.main.temp !== undefined ? Math.round(item.main.temp) : 0,
          condition: item.weather && item.weather[0] && item.weather[0].main ? item.weather[0].main : 'Clear',
          icon: item.weather && item.weather[0] && item.weather[0].icon ? item.weather[0].icon : '01d'
        }))
      };

      setWeather(formattedData);
      localStorage.setItem('weather_offline_cache', JSON.stringify(formattedData));
      processSystemAlerts(formattedData);

    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to load weather metrics.');
      
      // Cache recovery prevents a blank screen if network completely cuts out
      const cachedBackup = localStorage.getItem('weather_offline_cache');
      if (cachedBackup) {
        try {
          setWeather(JSON.parse(cachedBackup));
        } catch { setWeather(null); }
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LIVE DEVICE GEOLOCATION HOOK ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinatesUrlParam = `${position.coords.latitude},${position.coords.longitude}`;
          fetchWeatherApi(coordinatesUrlParam, true);
        },
        (error) => {
          console.warn("Location services access rejected. Using default city fallback.");
          fetchWeatherApi('Cape Town'); 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
      );
    } else {
      fetchWeatherApi('Cape Town');
    }
  }, []);

  // --- AUTOMATED BACKEND THREAT CHECKER ---
  const processSystemAlerts = (data: WeatherData) => {
    const customAlertTray: LocalAlert[] = [];

    if (data.temperature > 35) {
      customAlertTray.push({ id: 'heat', type: 'Severe Heat Warning', message: 'Abnormally high temperature metrics. Stay indoors and fully hydrated.' });
    }
    if (data.windSpeed > 30) {
      customAlertTray.push({ id: 'wind', type: 'High Wind Advisory', message: 'Gale force gusts detected. Secure unanchored properties.' });
    }
    if (data.humidity > 90) {
      customAlertTray.push({ id: 'humidity', type: 'Saturation Notice', message: 'Dense atmospheric moisture. Expect reduced road visibility conditions.' });
    }

    setAlerts(customAlertTray);

    if (customAlertTray.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Weather Alert: ${data.city}`, {
        body: customAlertTray.message,
        icon: `https://openweathermap.org{data.iconCode}.png`
      });
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // --- USER MOUSE INTERACTION HANDLERS ---
  const handleSearchClick = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      fetchWeatherApi(searchQuery.trim());
    }
  };

  const handleUnitToggle = () => {
    const nextUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ unit: nextUnit, theme }));
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ unit, theme: nextTheme }));
  };

  const handleBookmarkToggle = () => {
    if (!weather) return;
    const targetCityName = weather.city;
    const nextSavedList = savedCities.includes(targetCityName)
      ? savedCities.filter(name => name !== targetCityName)
      : [...savedCities, targetCityName];
    setSavedCities(nextSavedList);
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(nextSavedList));
  };

  const formatTemperature = (celsius: number): string => {
    if (unit === 'F') return `${Math.round((celsius * 9/5) + 32)}°F`;
    return `${celsius}°C`;
  };

  return (
    <div className={`app-workspace-canvas ${theme}-theme-mode`}>
      
      <header className="app-system-header">
        <h2>🌦️ WeatherHorizon Dashboard</h2>
        <div className="system-controls-row">
          <button onClick={handleUnitToggle} className="utility-action-btn">
            Units: {unit === 'C' ? 'Metric (°C)' : 'Imperial (°F)'}
          </button>
          <button onClick={handleThemeToggle} className="utility-action-btn">
            Mode: {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {alerts.length > 0 && (
        <section className="live-notification-tray" aria-label="System Alerts Tracker">
          {alerts.map(alertObj => (
            <div key={alertObj.id} className="system-alert-card danger-level">
              <span><strong>⚠️ {alertObj.type}:</strong> {alertObj.message}</span>
              <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alertObj.id))} className="dismiss-btn">✕</button>
            </div>
          ))}
        </section>
      )}

