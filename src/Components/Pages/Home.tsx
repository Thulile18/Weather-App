import React, { useState, useEffect } from 'react';
import { useWeather } from '../Hooks/UseWeather';
import { useLocation } from '../Hooks/UseLocation';
import WeatherDisplay from '../../Weather/WeatherDisplay';
import DailyForecast from '../../Weather/DailyForecast';
import WeatherAlert from '../../Weather/WeatherAlert';
import Button from '../Button';
import Input from '../Input';
import { Link } from 'react-router-dom'; 
import type { WeatherAlert as WeatherAlertType } from '../Types/Weather.types';
import HourlyForecast from '../../Weather/HourlyForecast';
import { requestNotificationPermission, sendWeatherNotification } from '../Utils/Notifications';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  
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

  // Standard student-appropriate browser notification controller logic
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted);
    };
    checkPermission();
  }, []);

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
          type: 'Heat Warning',
          severity: 'warning',
          message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.',
          time: new Date().toLocaleString()
        });
        sendWeatherNotification(
          `Weather Alert: ${currentWeather.location}`,
          'Extreme heat detected! Stay hydrated.'
        );
      }

      if (currentWeather.windspeed > 15) {
        newAlerts.push({
          type: 'Wind Advisory',
          severity: 'watch',
          message: 'High winds expected. Secure outdoor objects.',
          time: new Date().toLocaleString()
        });
        sendWeatherNotification(
          `Weather Alert: ${currentWeather.location}`,
          'High winds expected! Secure outdoor objects.'
        );
      }

      if (currentWeather.temperature < 0) {
        newAlerts.push({
          type: 'Freeze Warning',
          severity: 'warning',
          message: 'Freezing temperatures detected. Protect plants and pipes.',
          time: new Date().toLocaleString()
        });
        sendWeatherNotification(
          `Weather Alert: ${currentWeather.location}`,
          'Freezing temperatures! Protect plants and pipes.'
        );
      }

      if (currentWeather.condition.toLowerCase().includes('rain') && currentWeather.temperature > 30) {
        newAlerts.push({
          type: 'Storm Alert',
          severity: 'watch',
          message: 'Rain with high temperatures. Stay prepared.',
          time: new Date().toLocaleString()
        });
        sendWeatherNotification(
          `Weather Alert: ${currentWeather.location}`,
          'Rain with high temperatures. Be prepared.'
        );
      }

      if (currentWeather.condition.toLowerCase().includes('fog')) {
        newAlerts.push({
          type: 'Fog Advisory',
          severity: 'advisory',
          message: 'Low visibility due to fog. Drive carefully.',
          time: new Date().toLocaleString()
        });
        sendWeatherNotification(
          `Weather Alert: ${currentWeather.location}`,
          'Low visibility due to fog. Drive carefully.'
        );
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
      <div className="home-status-centered-canvas">
        <div className="status-message-wrapper">
          <div className="status-spinner-element"> Syncing </div>
          <p className="status-caption"> Loading meteorological data... </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-status-centered-canvas">
        <div className="status-message-wrapper">
          <div className="error-title-marker">Notice</div>
          <p className="error-text-details">{error}</p>
          <Button onClick={() => window.location.reload()}> Try Again </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      {!notificationPermission && (
        <div className="notification-reminder-banner">
          Attention: Enable notifications in system settings to receive push updates.
          <Link to="/settings" className="settings-redirect-link">
            Open Settings →
          </Link>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="active-alerts-stack">
          {alerts.map((alert, index) => (
            <WeatherAlert
              key={index}
              alert={alert}
              onDismiss={() => dismissAlert(index)}
            />
          ))}
        </div>
      )}

      <div className="search-controls-wrapper">
        <div className="search-form-row">
          <Input
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search city location..."
            onKeyPress={handleKeyPress}
            className="search-input-field"
          />
          <Button onClick={handleSearch} className="search-action-btn">
            Search
          </Button>
        </div>
      </div>

      {currentWeather && (
        <div className="weather-dashboard-layout-stack">
          <WeatherDisplay
            weather={currentWeather}
            unit={settings?.unit || 'celsius'}
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {forecast && (
            <div className="forecast-tab-controls-row">
              <Button
                variant={viewType === 'hourly' ? 'primary' : 'secondary'}
                onClick={() => setViewType('hourly')}
              >
                Hourly Timeline
              </Button>
              <Button
                variant={viewType === 'daily' ? 'primary' : 'secondary'}
                onClick={() => setViewType('daily')}
              >
                Daily Timeline
              </Button>
            </div>
          )}

          {forecast && (
            <div className="forecast-view-panel-node">
              {viewType === 'hourly' ? (
                <HourlyForecast
                  forecasts={forecast.hourly}
                  unit={settings?.unit === 'fahrenheit' ? 'F' : 'C'}
                />
              ) : (
                <DailyForecast
                  forecasts={forecast.daily}
                  unit={settings?.unit === 'fahrenheit' ? 'F' : 'C'}
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