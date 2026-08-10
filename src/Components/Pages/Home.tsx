import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../Hooks/UseWeather';
import { useLocation } from '../Hooks/UseLocation';
import WeatherDisplay from '../../Weather/WeatherDisplay';
import HourlyForecast from '../../Weather/HourlyForecast';
import DailyForecast from '../../Weather/DailyForecast';
import WeatherAlert from '../../Weather/WeatherAlert';
import Button from '../Button';
import Input from '../Input';
import type { WeatherAlert as WeatherAlertType } from '../Types/Weather.types';
import { NotificationService } from '../Utils/Notifications';

// Force compiler to ignore side-effect CSS imports globally from this view
// @ts-ignore
import '../../App.css';
// @ts-ignore
import '../Layout/Header.css';

const Home: React.FC = () => {
  // --- STATE VARIABLES ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  
  // --- WEATHER HOOK DATA ---
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
  
  // Helper variables for clean template code
  const favorites = getFavoriteLocations();
  
  // FIXED: Converts 'celsius' / 'fahrenheit' to exactly 'C' / 'F' to clear TS2322 error
  const currentUnit: 'C' | 'F' = settings?.unit === 'fahrenheit' ? 'F' : 'C';

  // --- EFFECT 1: Ask for browser notification permissions ---
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await NotificationService.requestPermission();
      setNotificationPermission(granted);
    };
    checkPermission();
  }, []);

  // --- EFFECT 2: Locate user automatically on startup ---
  useEffect(() => {
    if (userLocation && !currentWeather) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, currentWeather, fetchWeatherByCoords]);

  // --- EFFECT 3: Look out for dangerous weather scenarios ---
  useEffect(() => {
    if (!currentWeather) return;

    const newAlerts: WeatherAlertType[] = [];
    const city = currentWeather.location;

    // Check 1: Extreme Hot Temperature
    if (currentWeather.temperature > 35) {
      newAlerts.push({
        type: 'Heat Warning',
        severity: 'warning',
        message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Extreme heat detected! Stay hydrated.', 'warning');
    }
    
    // Check 2: Windy Gale Weather (Fixed property casing: windspeed)
    if (currentWeather.windspeed > 15) {
      newAlerts.push({
        type: 'Wind Advisory',
        severity: 'watch',
        message: 'High winds expected. Secure outdoor objects.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'High winds expected! Secure outdoor objects.', 'watch');
    }

    // Check 3: Frost and Ice Conditions
    if (currentWeather.temperature < 0) {
      newAlerts.push({
        type: 'Freeze Warning',
        severity: 'warning',
        message: 'Freezing temperatures detected. Protect plants and pipes.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Freezing temperatures! Protect plants and pipes.', 'warning');
    }

    // Check 4: Hot Storms
    const conditionText = currentWeather.condition.toLowerCase();
    if (conditionText.includes('rain') && currentWeather.temperature > 30) {
      newAlerts.push({
        type: 'Storm Alert',
        severity: 'watch',
        message: 'Rain with high temperatures. Stay prepared.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Rain with high temperatures. Be prepared.', 'watch');
    }

    // Check 5: Dense Fog
    if (conditionText.includes('fog')) {
      newAlerts.push({
        type: 'Fog Advisory',
        severity: 'advisory',
        message: 'Low visibility due to fog. Drive carefully.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Low visibility due to fog. Drive carefully.', 'advisory');
    }

    setAlerts(newAlerts);
    
    // Target dependencies specifically to prevent endless execution loops
  }, [currentWeather?.location, currentWeather?.temperature, currentWeather?.windspeed, currentWeather?.condition]);

  // --- COMPONENT HANDLERS ---
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

  // --- APP LOADING STATE ---
  if (loading || locationLoading) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon loading-animation"></div>
          <p className="status-text">Loading weather data...</p>
        </div>
      </div>
    );
  }

  // --- APP ERROR STATE ---
  if (error) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon"></div>
          <p className="error-message-text">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // --- FINAL RENDER TEMPLATE ---
  return (
    <div className="main-page-wrapper">
      {/* System Notification Setup Flag */}
      {!notificationPermission && (
        <div className="permission-alert-banner">
           Enable notifications in Settings to receive weather alerts.
          <Link to="/settings" className="settings-redirect-link">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Extreme Weather Alerts Dashboard */}
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

      {/* Input Search Controls Layout */}
      <div className="search-section-box">
        <div className="search-input-group">
          <Input
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search city..."
            onKeyPress={handleKeyPress}
            className="city-search-input"
          />
          <Button onClick={handleSearch} className="search-submit-button">
             Search
          </Button>
        </div>
      </div>

      {/* Meteorological Data Presentation Area */}
      {currentWeather && (
        <div className="dashboard-content-stack">
          <WeatherDisplay
            weather={currentWeather}
            unit={currentUnit}
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {/* Forecast Switch Controls Row */}
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

          {/* Forecast Data Breakdown Cards */}
          {forecast && (
            <div className="forecast-results-container">
              {viewType === 'hourly' ? (
                <HourlyForecast 
                  data={forecast.hourly || []} 
                  unit={currentUnit} 
                />
              ) : (
                <DailyForecast 
                  data={forecast.daily || []} 
                  unit={currentUnit} 
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
