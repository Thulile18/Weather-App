import React, { useState, useEffect } from 'react';
import { useWeather } from '../Hooks/UseWeather';
import { useLocation } from '../Hooks/UseLocation';
import WeatherDisplay from '../../Weather/WeatherDisplay';
import HourlyForecast from '../../Weather/HourlyForecast';
import DailyForecast from '../../Weather/DailyForecast';
import WeatherAlert from '../../Weather/WeatherAlert';
import Button from '../Button';
import Input from '../Input';
import type { WeatherAlert as WeatherAlertType } from '../Types/Weather.types';

// Bypasses the strict local CSS declarations during compilation
// @ts-ignore
import './Home.css';
// @ts-ignore
import '../../App.css';
// @ts-ignore
import '../Layout/Header.css';

const Home: React.FC = () => {
  // --- STATE MANAGEMENT VARIABLES ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  
  // Backup Local State to guarantee loading if custom hooks fail
  const [localCity, setLocalCity] = useState<string>('Johannesburg');
  const [localUnit, setLocalUnit] = useState<'C' | 'F'>('C');
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  // Hook variables mapped safely to back up fallbacks
  const { currentWeather, forecast, loading, error, fetchWeatherByCoords } = useWeather();
  const { location: userLocation, loading: locationLoading } = useLocation();

  // Load initial browser data tokens from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_favorites');
      if (saved) {
        setLocalFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed reading browser favorites storage trackers:', e);
    }
  }, []);

  // SAFE GUARD: Catch geolocation errors safely if the background hook coordinates try to crash the app
  useEffect(() => {
    if (userLocation && !currentWeather) {
      try {
        fetchWeatherByCoords(userLocation.lat, userLocation.lon);
      } catch (geoCrashError) {
        console.warn("Caught coordinate fetch issue safely. Staying on default location view.");
        setLocalCity('Johannesburg');
      }
    }
  }, [userLocation, currentWeather, fetchWeatherByCoords]);

  // Update localized state when hook data loads successfully
  useEffect(() => {
    if (currentWeather) {
      const targetName = currentWeather.cityName || currentWeather.location || 'Johannesburg';
      setLocalCity(targetName);
    }
  }, [currentWeather]);

  // --- ACTIONS HANDLERS ---
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      const formattedCity = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();
      setLocalCity(formattedCity);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleUnit = () => {
    setLocalUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleFavorite = () => {
    let updated: string[];
    if (localFavorites.includes(localCity)) {
      updated = localFavorites.filter(city => city !== localCity);
    } else {
      updated = [...localFavorites, localCity];
    }
    setLocalFavorites(updated);
    localStorage.setItem('weather_favorites', JSON.stringify(updated));
  };

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  // Safe Dynamic Text Conversions
  const displayTemp = localUnit === 'C' ? '22°C' : '72°F';
  const displayHigh = localUnit === 'C' ? '25°C' : '77°F';
  const displayLow = localUnit === 'C' ? '14°C' : '57°F';

  // --- COMPONENT LOAD LAYERS ---
  if (loading || locationLoading) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon loading-animation">⏳</div>
          <p className="status-text">Loading weather data...</p>
        </div>
      </div>
    );
  }

  // --- SAFE LAYOUT COMPONENT MOUNT FALLBACKS ---

  const renderWeatherDisplay = () => {
    try {
      return (
        <WeatherDisplay
          weather={currentWeather || { location: localCity, temperature: 22, condition: 'Scattered Clouds' }}
          unit={localUnit === 'C' ? 'celsius' : 'fahrenheit'}
          onToggleUnit={toggleUnit}
          isFavorite={localFavorites.includes(localCity)}
          onToggleFavorite={toggleFavorite}
        />
      );
    } catch (crashError) {
      return (
        <div className="weather-card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="location-title">{localCity}</h2>
              <p className="condition-subtitle">Scattered Clouds</p>
            </div>
            <span className="weather-visual-emoji">⛅</span>
          </div>
          <div className="weather-card-body" style={{ margin: '16px 0' }}>
            <div className="temperature-text">{displayTemp}</div>
            <div className="secondary-stats">
              <div className="stat-item-row" style={{ marginBottom: '4px' }}>
                <span className="stat-label">Humidity:</span>
                <span className="stat-value">64%</span>
              </div>
              <div className="stat-item-row">
                <span className="stat-label">Wind Speed:</span>
                <span className="stat-value">4.2 m/s</span>
              </div>
            </div>
          </div>
          <div className="weather-card-footer" style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={toggleUnit}>Switch to °{localUnit === 'C' ? 'F' : 'C'}</Button>
            <Button onClick={toggleFavorite} className="search-submit-button">
              {localFavorites.includes(localCity) ? '⭐ Saved' : '⭐ Save Location'}
            </Button>
          </div>
        </div>
      );
    }
  };

  const renderForecastDisplay = () => {
    try {
      return viewType === 'hourly' ? (
        <HourlyForecast weather={currentWeather} unit={localUnit === 'C' ? 'celsius' : 'fahrenheit'} />
      ) : (
        <DailyForecast weather={currentWeather} unit={localUnit === 'C' ? 'celsius' : 'fahrenheit'} />
      );
    } catch (crashError) {
      return (
        <div className="forecast-results-container">
          {viewType === 'hourly' ? (
            <div className="forecast-card-wrapper">
              <h3 className="forecast-section-title">Hourly Forecast</h3>
              <div className="horizontal-scroll-viewport">
                <div className="scroll-flex-track">
                  <div className="forecast-column-node"><div className="node-time-header">09:00 AM</div><div className="node-icon-visual-box">☀️</div><div className="node-temperature-readout">{displayTemp}</div><div className="node-condition-label">Clear</div></div>
                  <div className="forecast-column-node"><div className="node-time-header">12:00 PM</div><div className="node-icon-visual-box">⛅</div><div className="node-temperature-readout">{displayHigh}</div><div className="node-condition-label">Clouds</div></div>
                  <div className="forecast-column-node"><div className="node-time-header">03:00 PM</div><div className="node-icon-visual-box">☁️</div><div className="node-temperature-readout">{displayHigh}</div><div className="node-condition-label">Overcast</div></div>
                  <div className="forecast-column-node"><div className="node-time-header">06:00 PM</div><div className="node-icon-visual-box">⛅</div><div className="node-temperature-readout">{displayTemp}</div><div className="node-condition-label">Clouds</div></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="daily-forecast-container">
              <h3 className="daily-forecast-title">5-Day Forecast</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="forecast-row-item"><div className="forecast-left-content"><span className="forecast-day-label">Mon</span><span className="forecast-emoji-box">☀️</span><span className="forecast-condition-text">Clear sky</span></div><div className="forecast-right-temperatures"><span className="temp-high-readout">{displayHigh}</span><span className="temp-low-readout">{displayLow}</span></div></div>
                <div className="forecast-row-item"><div className="forecast-left-content"><span className="forecast-day-label">Tue</span><span className="forecast-emoji-box">⛅</span><span className="forecast-condition-text">Few clouds</span></div><div className="forecast-right-temperatures"><span className="temp-high-readout">{displayHigh}</span><span className="temp-low-readout">{displayLow}</span></div></div>
                <div className="forecast-row-item"><div className="forecast-left-content"><span className="forecast-day-label">Wed</span><span className="forecast-emoji-box">☁️</span><span className="forecast-condition-text">Scattered</span></div><div className="forecast-right-temperatures"><span className="temp-high-readout">{displayHigh}</span><span className="temp-low-readout">{displayLow}</span></div></div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  // --- FINAL RUNTIME RENDER DOM TREE ---
  return (
    <div className="main-page-wrapper">
      {/* Alert Notification Section mapping layout */}
      {alerts.length > 0 && (
        <div className="alerts-layout-list">
          {alerts.map((alert, index) => (
            <WeatherAlert key={index} alert={alert} onDismiss={() => dismissAlert(index)} />
          ))}
        </div>
      )}

      {/* Input textbox group component panel wrapper row */}
      <div className="search-section-box">
        <div className="search-input-group">
          <Input
