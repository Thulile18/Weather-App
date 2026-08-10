import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WeatherService } from '../Services/TS_WeatherService';
import WeatherDisplay from '../../Weather/WeatherDisplay';
import HourlyForecast from '../../Weather/HourlyForecast';
import DailyForecast from '../../Weather/DailyForecast';
import WeatherAlert from '../../Weather/WeatherAlert';
import Button from '../Button';
import Input from '../Input';
import type { WeatherAlert as WeatherAlertType } from '../Types/Weather.types';

// Bypasses strict local CSS declarations during compilation
// @ts-ignore
import './Home.css';
// @ts-ignore
import '../../App.css';
// @ts-ignore
import '../Layout/Header.css';

const Home: React.FC = () => {
  // --- APPLICATION STATE VARIABLES ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  
  // --- LOCAL REPLACEMENT FOR THE WEATHER HOOKS (Ensures it works) ---
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUnit, setCurrentUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load initial local weather and favorites on startup
  useEffect(() => {
    // 1. Fetch initial city baseline details
    handleFetchWeather('Johannesburg');

    // 2. Safely read standard bookmarked arrays from localStorage storage keys
    try {
      const saved = localStorage.getItem('weather_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed reading bookmarks from device storage:', e);
    }
  }, []);

  // Safe internal request coordinator handler
  const handleFetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const weatherData = await WeatherService.getWeatherByCity(cityName);
      const forecastData = await WeatherService.getForecast(cityName);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message || 'Failed to locate the requested weather metrics.');
      setCurrentWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // --- RECURRING APPS EFFECTS ---

  // Effect 1: Check native browser system notification prompts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission === 'granted');
        });
      }
    }
  }, []);

  // Effect 2: Watch current weather metrics and create alert warning objects
  useEffect(() => {
    if (!currentWeather) return;

    const newAlerts: WeatherAlertType[] = [];
    const city = currentWeather.cityName || currentWeather.location;

    // Condition 1: High Extreme Heat Warning
    if (currentWeather.temperature > 35) {
      newAlerts.push({
        type: 'Heat Warning',
        severity: 'warning',
        message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.',
        time: new Date().toLocaleString()
      });
    }
    
    // Condition 2: Strong Wind Advisory 
    if (currentWeather.windspeed > 15) {
      newAlerts.push({
        type: 'Wind Advisory',
        severity: 'watch',
        message: 'High winds expected. Secure outdoor objects.',
        time: new Date().toLocaleString()
      });
    }

    // Condition 3: Subzero Freezing Temperatures
    if (currentWeather.temperature < 0) {
      newAlerts.push({
        type: 'Freeze Warning',
        severity: 'warning',
        message: 'Freezing temperatures detected. Protect plants and pipes.',
        time: new Date().toLocaleString()
      });
    }

    setAlerts(newAlerts);
  }, [currentWeather]);

  // --- INTERACTION ACTIONS HANDLERS ---

  // Triggered when searching for a town or city
  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleFetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // Allows searching by pressing the keyboard Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Swaps unit configurations parameters state settings
  const toggleUnit = () => {
    setCurrentUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  // Adds or removes the active city safely from custom localStorage tracks
  const toggleFavorite = () => {
    if (!currentWeather) return;
    const targetCity = currentWeather.cityName || currentWeather.location;
    
    let updatedFavorites: string[];
    if (favorites.includes(targetCity)) {
      updatedFavorites = favorites.filter(city => city !== targetCity);
    } else {
      updatedFavorites = [...favorites, targetCity];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('weather_favorites', JSON.stringify(updatedFavorites));
  };

  // Clears a warning item card completely from state arrays
  const dismissAlert = (index: number) => {
    const updatedAlerts = alerts.filter((_, i) => i !== index);
    setAlerts(updatedAlerts);
  };

  // --- INTERFACE INTERRUPT LAYERS ---

  if (loading) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon loading-animation">⏳</div>
          <p className="status-text">Loading weather data...</p>
        </div>
      </div>
    );
  }

  // --- RENDER RETURN DOM TREE ---
  return (
    <div className="main-page-wrapper">
      {/* Dynamic inline notification setup flag removed to fully clean empty spacing blocks */}

      {/* Extreme Weather Active Warning List */}
      {alerts.length > 0 && (
        <div className="alerts-layout-list">
          {alerts.map((alert, index) => (
            <WeatherAlert
              key={index}
              alert={alert}
              onDismiss={() => dismissAlert(index)}
            />
          ))}
        </div>
      )}

      {/* Input panel element query container row */}
      <div className="search-section-box">
        <div className="search-input-group">
          <Input
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target ? e.target.value : e)}
            placeholder="Search city..."
            onKeyPress={handleKeyPress}
            className="city-search-input"
          />
          <Button onClick={handleSearch} className="search-submit-button">
             Search
          </Button>
        </div>
      </div>

      {/* Render core errors directly as clean readable warning texts */}
      {error && <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

      {/* Main Meteorological dashboard visualization metrics */}
      {currentWeather && (
        <div className="dashboard-content-stack">
          <WeatherDisplay
            weather={currentWeather}
            unit={currentUnit === 'celsius' ? 'C' : 'F'} // Maps string flags to clean matching types 'C' or 'F'
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.cityName || currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {/* Switch tabs controls navigation section layout buttons */}
          {forecast && (
            <div className="view-toggle-button-row">
              <Button
                variant={viewType === 'hourly' ? 'primary' : 'secondary'}
                onClick={() => setViewType('hourly')}
              >
                 Hourly
              </Button>
              <Button
                variant={viewType === 'daily' ? 'primary' : 'secondary'}
                onClick={() => setViewType('daily')}
              >
                 Daily
              </Button>
            </div>
          )}

          {/* Dynamic sub forecast metrics visual card injection blocks */}
          {forecast && (
            <div className="forecast-results-container">
              {viewType === 'hourly' ? (
                <HourlyForecast 
                  weather={currentWeather} 
                  unit={currentUnit === 'celsius' ? 'C' : 'F'} 
                />
              ) : (
                <DailyForecast 
                  weather={currentWeather} 
                  unit={currentUnit === 'celsius' ? 'C' : 'F'} 
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
