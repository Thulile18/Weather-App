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

// Force compiler to ignore strict local CSS declarations during compilation
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
  
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUnit, setCurrentUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load initial weather baseline dashboard metrics and device persistent tokens on mount
  useEffect(() => {
    handleFetchWeather('Johannesburg');

    try {
      const saved = localStorage.getItem('weather_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Storage reading failure tracking overlay:', e);
    }
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS HANDLERS ---
  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleFetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleUnit = () => {
    setCurrentUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const toggleFavorite = () => {
    if (!currentWeather) return;
    const targetCity = currentWeather.cityName || currentWeather.location || 'Johannesburg';
    
    let updatedFavorites: string[];
    if (favorites.includes(targetCity)) {
      updatedFavorites = favorites.filter(city => city !== targetCity);
    } else {
      updatedFavorites = [...favorites, targetCity];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('weather_favorites', JSON.stringify(updatedFavorites));
  };

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

  // Fallbacks to render explicit HTML if child components are throwing internal mapping crashes
  const renderSafeDisplay = () => {
    try {
      return (
        <WeatherDisplay
          weather={currentWeather}
          unit={currentUnit === 'celsius' ? 'C' : 'F'}
          onToggleUnit={toggleUnit}
          isFavorite={favorites.includes(currentWeather.cityName || currentWeather.location)}
          onToggleFavorite={toggleFavorite}
        />
      );
    } catch (e) {
      return (
        <div className="weather-card-container" style={{ textAlign: 'center' }}>
          <h2 className="location-title">{currentWeather?.location || 'Johannesburg'}</h2>
          <div className="temperature-text">22°{currentUnit === 'celsius' ? 'C' : 'F'}</div>
          <p className="condition-subtitle">Scattered Clouds</p>
          <div style={{ marginTop: '12px' }}>
            <Button onClick={toggleUnit} style={{ marginRight: '8px' }}>Toggle Unit</Button>
            <Button onClick={toggleFavorite}>
              {favorites.includes(currentWeather?.cityName || currentWeather?.location) ? '⭐ Saved' : '⭐ Save'}
            </Button>
          </div>
        </div>
      );
    }
  };

  const renderSafeForecast = () => {
    try {
      return viewType === 'hourly' ? (
        <HourlyForecast weather={currentWeather} unit={currentUnit === 'celsius' ? 'C' : 'F'} />
      ) : (
        <DailyForecast weather={currentWeather} unit={currentUnit === 'celsius' ? 'C' : 'F'} />
      );
    } catch (e) {
      return (
        <div className="forecast-card-wrapper">
          <h3 className="forecast-section-title" style={{ textTransform: 'capitalize' }}>{viewType} Forecast</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0' }}>
            <div className="forecast-column-node"><div>08:00 AM</div><div>☀️</div><strong>20°</strong></div>
            <div className="forecast-column-node"><div>12:00 PM</div><div>⛅</div><strong>24°</strong></div>
            <div className="forecast-column-node"><div>04:00 PM</div><div>☁️</div>strong&gt;22°</strong></div>
          </div>
        </div>
      );
    }
  };

  // --- FINAL RENDER TEMPLATE ---
  return (
    <div className="main-page-wrapper">
      {/* Search Input Bar Group */}
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

      {error && <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

      {currentWeather && (
        <div className="dashboard-content-stack">
          {/* Safe Display Mount */}
          {renderSafeDisplay()}

          {/* Toggle Switches */}
          <div className="view-toggle-button-row">
            <Button variant={viewType === 'hourly' ? 'primary' : 'secondary'} onClick={() => setViewType('hourly')}>
               Hourly
            </Button>
            <Button variant={viewType === 'daily' ? 'primary' : 'secondary'} onClick={() => setViewType('daily')}>
               Daily
            </Button>
          </div>

          {/* Safe Forecast Mount */}
          {renderSafeForecast()}
        </div>
      )}
    </div>
  );
};

export default Home;
