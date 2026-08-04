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

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  
  const {
    currentWeather,
    forecast,
    loading,
    error,
    settings,
    fetchWeather,
    fetchWeatherByCoords,
    updateSettings,
    saveLocation,
    removeLocation,
    getFavoriteLocations
  } = useWeather();

  const { location: userLocation, loading: locationLoading } = useLocation();
  const favorites = getFavoriteLocations();

  useEffect(() => {
    if (userLocation && !currentWeather) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation]);

  useEffect(() => {
    if (currentWeather) {
      const newAlerts: WeatherAlertType[] = [];
      
      if (currentWeather.temperature > 35) {
        newAlerts.push({
          type: 'Extreme Heat Warning',
          severity: 'warning',
          message: 'Extreme temperature thresholds exceeded. Stay hydrated and avoid outdoor exposure.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      if (currentWeather.windspeed > 15) { 
        newAlerts.push({
          type: 'Gale Force Wind Advisory',
          severity: 'watch',
          message: 'High speed turbulence active. Secure loose outdoor property.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      setAlerts(newAlerts);
    }
  }, [currentWeather]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleUnit = () => {
    if (settings) {
      const newUnit = settings.unit === 'celsius' ? 'fahrenheit' : 'celsius';
      updateSettings({ ...settings, unit: newUnit });
    }
  };

  const toggleFavorite = () => {
    if (currentWeather) {
      const isFavorite = favorites.includes(currentWeather.location);
      if (isFavorite) {
        removeLocation(currentWeather.location);
      } else {
        saveLocation(currentWeather.location);
      }
    }
  };

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  if (loading || locationLoading) {
    return (
      <div className="status-centered-viewport">
        <div className="status-card-inner">
          <div className="loading-pulse-animation"></div>
          <p className="status-label-text"> Retrieving real-time atmospheric payload coordinates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-centered-viewport">
        <div className="status-card-inner">
          <div className="error-icon-emoji"></div>
          <p className="error-label-text">{error}</p>
          <Button onClick={() => window.location.reload()} variant="danger">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-dashboard-layout-view">
      
      {alerts.length > 0 && (
        <div className="dashboard-notifications-stack">
          {alerts.map((alert, index) => (
            <WeatherAlert
              key={index}
              alert={alert}
              onDismiss={() => dismissAlert(index)}
            />
          ))}
        </div>
      )}

      <div className="dashboard-search-control-block">
        <div className="input-inline-group-form">
          <Input
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search location..."
            onKeyPress={handleKeyPress}
            className="flex-input-grow"
          />
          <Button onClick={handleSearch}>
             Search
          </Button>
        </div>
      </div>

      {currentWeather && (
        <div className="dashboard-data-presentation-wrapper">
          <WeatherDisplay
            weather={currentWeather}
            unit={settings?.unit || 'celsius'}
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {forecast && (
            <div className="dashboard-forecast-filter-row">
              <Button
                variant={viewType === 'hourly' ? 'primary' : 'secondary'}
                onClick={() => setViewType('hourly')}
              >
                 Hourly Overview
              </Button>
              <Button
                variant={viewType === 'daily' ? 'primary' : 'secondary'}
                onClick={() => setViewType('daily')}
              >
                 7-Day Forecast
              </Button>
            </div>
          )}

          {forecast && (
            <div className="dashboard-forecast-render-node">
              {viewType === 'hourly' ? (
                <HourlyForecast
                  forecasts={forecast.hourly}
                  unit={settings?.unit === 'celsius' ? 'C' : 'F'}
                />
              ) : (
                <DailyForecast
                  forecasts={forecast.daily}
                  unit={settings?.unit === 'celsius' ? 'C' : 'F'}
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