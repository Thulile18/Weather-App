import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// --- CONFIGURATION INTEGRATION (Directly using your file constants) ---
const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: '8bb16bb5510615456144f052661fbf80', 
  UNITS: 'metric'
};

const STORAGE_KEYS = {
  SAVED_LOCATIONS: 'weather_saved_locations', 
  USER_SETTINGS: 'weather_user_settings'
};

// --- DATA STRUCTURE TYPING ---
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
  // --- STATE DECLARATIONS ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Customisation & Persistence Settings
  const [unit, setUnit] = useState<'C' | 'F'>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.unit || 'C';
    }
    return 'C';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.theme || 'light';
    }
    return 'light';
  });

  const [savedCities, setSavedCities] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  // --- CORE ENGINE: FETCH FROM OPENWEATHERMAP API ---
  const fetchWeatherApi = async (paramString: string, isCoords: boolean = false) => {
    setLoading(true);
    setErrorMessage('');
    
    // Construct the dynamic request endpoint string securely
    let endpoint = `${API_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(paramString)}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
    
    if (isCoords) {
      const [lat, lon] = paramString.split(',');
      endpoint = `${API_CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Location not found. Please verify the spelling and try again.');
      }
      
      const data = await response.json();
      
      // Target the first item in the list array for current telemetry metrics
      const currentInfo = data.list[0];

      // Parse OpenWeatherMap data structure into a student-friendly clean object layout
      const formattedData: WeatherData = {
        city: data.city.name,
        temperature: Math.round(currentInfo.main.temp),
        humidity: currentInfo.main.humidity,
        windSpeed: Math.round(currentInfo.wind.speed * 3.6), // Convert meter/sec to km/h
        condition: currentInfo.weather[0].main,
        iconCode: currentInfo.weather[0].icon,
        
        // Grab the next 4 immediate 3-hour increments for the hourly view timeline
        hourly: data.list.slice(0, 4).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon
        })),
        
        // Filter out mid-day values (every 8th record) to build standard daily items block
        daily: data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 4).map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        }))
      };

      setWeather(formattedData);
      
      // Save data locally for backup offline loading access layers
      localStorage.setItem('weather_offline_cache', JSON.stringify(formattedData));
      
      // Evaluate metrics against system alert parameters
      processSystemAlerts(formattedData);

    } catch (error: any) {
      setErrorMessage(error.message || 'Connection timeout. Check your network.');
      
      // Requirement 6: Pull offline cache immediately to stop screen going blank
      const cachedBackup = localStorage.getItem('weather_offline_cache');
      if (cachedBackup) {
        setWeather(JSON.parse(cachedBackup));
      }
    } finally {
      setLoading(false);
    }
  };

  // --- AUTOMATIC EXACT USER LOCATION ACCESSIBILITY (Requirement 2.a) ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Captures exact global geographical latitude and longitude coordinates
          const coordinatesUrlParam = `${position.coords.latitude},${position.coords.longitude}`;
          fetchWeatherApi(coordinatesUrlParam, true);
        },
        (error) => {
          // Inform the student/user gracefully via a background notification alternative
          console.warn("Location tracking permission denied. Using fallback city context layout.");
          fetchWeatherApi('Cape Town'); 
        }
      );
    } else {
      fetchWeatherApi('Cape Town');
    }
  }, []);

  // --- WEATHER ALERTS PROCESS ENGINE (Requirement 3.a) ---
  const processSystemAlerts = (data: WeatherData) => {
    const customAlertTray: LocalAlert[] = [];

    if (data.temperature > 35) {
      customAlertTray.push({ id: 'heat', type: 'Extreme Heat warning', message: 'Temperature levels are abnormally high. Limit outdoor exposure.' });
    }
    if (data.windSpeed > 30) {
      customAlertTray.push({ id: 'wind', type: 'High Wind advisory', message: 'Gale force winds present. Secure outdoor property items.' });
    }
    if (data.humidity > 90) {
      customAlertTray.push({ id: 'humidity', type: 'Humidity warning', message: 'Heavy saturation peaks. Expect visual moisture fog hazards.' });
    }

    setAlerts(customAlertTray);

    // Push browser notification alert message blocks
    if (customAlertTray.length > 0 && Notification.permission === 'granted') {
      new Notification(`Severe Weather Alert: ${data.city}`, {
        body: customAlertTray[0].message,
        icon: `https://openweathermap.org{data.iconCode}.png`
      });
    }
  };

  // Request native permission access setups safely during mounting stages
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // --- INTERACTION & PERSISTENCE STATE UTILITIES (Requirement 4 & 5) ---
  const handleSearchClick = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      fetchWeatherApi(searchQuery.trim());
    }
  };

  const saveConfiguration = (updatedUnit: 'C' | 'F', updatedTheme: 'light' | 'dark') => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ unit: updatedUnit, theme: updatedTheme }));
  };

  const handleUnitToggle = () => {
    const nextUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    saveConfiguration(nextUnit, theme);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    saveConfiguration(unit, nextTheme);
  };

  const handleBookmarkToggle = () => {
    if (!weather) return;
    const targetCityName = weather.city;

    let nextSavedList: string[];
    if (savedCities.includes(targetCityName)) {
      nextSavedList = savedCities.filter(name => name !== targetCityName);
    } else {
      nextSavedList = [...savedCities, targetCityName];
    }

    setSavedCities(nextSavedList);
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(nextSavedList));
  };

  // Dynamic Temperature value convertor function block (Avoids hardcoding templates)
  const formatTemperature = (celsius: number): string => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9/5) + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  return (
    <div className={`app-workspace-canvas ${theme}-theme-mode`}>
      
      {/* Structural Controls Toolbar Strip */}
      <header className="app-system-header">
        <h2>🌦️ WeatherHorizon Dashboard</h2>
        <div className="system-controls-row">
          <button onClick={handleUnitToggle} className="utility-action-btn">
            Units: {unit === 'C' ? 'Metric (°C)' : 'Imperial (°F)'}
          </button>
          <button onClick={handleThemeToggle} className="utility-action-btn">
            Mode: {theme === 'light' ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Active Severe Alert Message Display Blocks Area */}
      {alerts.length > 0 && (
        <section className="live-notification-tray" aria-label="System Alerts Monitoring Block">
          {alerts.map(alertObj => (
            <div key={alertObj.id} className="system-alert-card danger-level">
              <span><strong>⚠️ {alertObj.type}:</strong> {alertObj.message}</span>
              <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alertObj.id))} className="dismiss-btn">✕</button>
            </div>
          ))}
        </section>
      )}

      {/* Manual City Query Input Forms Wrapper Element Panel */}
      <section className="search-management-section">
