import React, { useState, useEffect } from 'react';
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

  // --- NETWORK DATA FETCH ENGINE ---
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
        throw new Error('Target city location could not be found.');
      }
      
      const data = await response.json();
      
      if (!data || !data.list || data.list.length === 0) {
        throw new Error('Invalid weather response format.');
      }
      
      const currentInfo = data.list[0];

      const formattedData: WeatherData = {
        city: data.city && data.city.name ? data.city.name : 'Current Location',
        temperature: currentInfo.main ? Math.round(currentInfo.main.temp) : 0,
        humidity: currentInfo.main ? currentInfo.main.humidity : 0,
        windSpeed: currentInfo.wind ? Math.round(currentInfo.wind.speed * 3.6) : 0, 
        condition: currentInfo.weather && currentInfo.weather[0] ? currentInfo.weather[0].main : 'Clear',
        iconCode: currentInfo.weather && currentInfo.weather[0] ? currentInfo.weather[0].icon : '01d',
        
        hourly: data.list.slice(0, 4).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: item.main ? Math.round(item.main.temp) : 0,
          icon: item.weather && item.weather[0] ? item.weather[0].icon : '01d'
        })),
        
        daily: data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 4).map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          temp: item.main ? Math.round(item.main.temp) : 0,
          condition: item.weather && item.weather[0] ? item.weather[0].main : 'Clear',
          icon: item.weather && item.weather[0] ? item.weather[0].icon : '01d'
        }))
      };

      setWeather(formattedData);
      localStorage.setItem('weather_offline_cache', JSON.stringify(formattedData));
      processSystemAlerts(formattedData);

    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to load weather metrics.');
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

  // --- DEVICE GEOLOCATION HOOK ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          fetchWeatherApi(coords, true);
        },
        (error) => {
          console.warn("Location access denied. Using default city.");
          fetchWeatherApi('Cape Town'); 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
      );
    } else {
      fetchWeatherApi('Cape Town');
    }
  }, []);

  // --- ALERTS TRIGGER ENGINE ---
  const processSystemAlerts = (data: WeatherData) => {
    const customAlertTray: LocalAlert[] = [];
    if (data.temperature > 35) {
      customAlertTray.push({ id: 'heat', type: 'Severe Heat Warning', message: 'Abnormally high temperature metrics. Stay indoors.' });
    }
    if (data.windSpeed > 30) {
      customAlertTray.push({ id: 'wind', type: 'High Wind Advisory', message: 'Gale force gusts detected.' });
    }
    if (data.humidity > 90) {
      customAlertTray.push({ id: 'humidity', type: 'Saturation Notice', message: 'Dense atmospheric moisture.' });
    }
    setAlerts(customAlertTray);
  };

  // --- USER INTERACTION HANDLERS ---
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
    let nextSavedList: string[] = [];

    if (savedCities.includes(targetCityName)) {
      nextSavedList = savedCities.filter(c => c !== targetCityName);
    } else {
      nextSavedList = [...savedCities, targetCityName];
    }
    
    setSavedCities(nextSavedList);
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(nextSavedList));
  };

  const convertTemp = (celsius: number) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  return (
    <div className={`home-container ${theme}`}>
      <header className="home-header">
        <h1>Weather App</h1>
        <div className="header-controls">
          <button onClick={handleUnitToggle} className="btn-toggle">
            Scale: °{unit}
          </button>
          <button onClick={handleThemeToggle} className="btn-toggle">
            Mode: {theme === 'light' ? ' Dark' : ' Light'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSearchClick} className="search-form">
        <input 
          type="text" 
          placeholder="Search location..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Find</button>
      </form>

      {loading && <div className="loader">Loading weather metrics...</div>}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <strong>{alert.type}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}

      {weather && !loading && (
        <main className="weather-display">
          <div className="current-weather-card">
            <h2>
              {weather.city}
              <button onClick={handleBookmarkToggle} className="btn-bookmark">
                {savedCities.includes(weather.city) ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
            </h2>
            <div className="current-main">
              <img 
                src={`https://openweathermap.org{weather.iconCode}@2x.png`} 
                alt={weather.condition} 
              />
              <span className="current-temp">{convertTemp(weather.temperature)}°{unit}</span>
            </div>
            <p className="condition-text">{weather.condition}</p>
            <div className="metrics-grid">
              <div>Humidity: {weather.humidity}%</div>
              <div>Wind: {weather.windSpeed} km/h</div>
            </div>
          </div>

          <div className="forecast-controls">
            <button 
              onClick={() => setViewType('hourly')} 
              className={`btn-tab ${viewType === 'hourly' ? 'active' : ''}`}
            >
              Hourly Timeline
            </button>
            <button 
              onClick={() => setViewType('daily')} 
