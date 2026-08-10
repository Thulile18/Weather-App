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
  
  // --- OPERATIONS CUSTOM HOOKS ---
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
  
  // Helper variables for clean rendering templates
  const favorites = getFavoriteLocations();
  const currentUnit = settings?.unit || 'celsius';

  // --- RECURRING SIDE EFFECTS ---

  // Effect 1: Verify browser notification permissions
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await NotificationService.requestPermission();
      setNotificationPermission(granted);
    };
    checkPermission();
  }, []);

  // Effect 2: Capture initial user location coordinates on startup
  useEffect(() => {
    if (userLocation && !currentWeather) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, currentWeather, fetchWeatherByCoords]);

  // Effect 3: Track weather updates to trigger alerts
  useEffect(() => {
    if (!currentWeather) return;

    const newAlerts: WeatherAlertType[] = [];
    const city = currentWeather.cityName || currentWeather.location;

    // Warning Check 1: Extreme Hot Temperature
    if (currentWeather.temperature > 35) {
      newAlerts.push({
        type: 'Heat Warning',
        severity: 'warning',
        message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Extreme heat detected! Stay hydrated.', 'warning');
    }
    
    // Warning Check 2: Severe Windy Gale
    if (currentWeather.windspeed > 15) {
      newAlerts.push({
        type: 'Wind Advisory',
        severity: 'watch',
        message: 'High winds expected. Secure outdoor objects.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'High winds expected! Secure outdoor objects.', 'watch');
    }

    // Warning Check 3: Below Zero Freeze
    if (currentWeather.temperature < 0) {
      newAlerts.push({
        type: 'Freeze Warning',
        severity: 'warning',
        message: 'Freezing temperatures detected. Protect plants and pipes.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Freezing temperatures! Protect plants and pipes.', 'warning');
    }

    // Warning Check 4: Combined Rain and High Heat
    const conditionText = currentWeather.condition ? currentWeather.condition.toLowerCase() : '';
    if (conditionText.includes('rain') && currentWeather.temperature > 30) {
      newAlerts.push({
        type: 'Storm Alert',
        severity: 'watch',
        message: 'Rain with high temperatures. Stay prepared.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Rain with high temperatures. Be prepared.', 'watch');
    }

    // Warning Check 5: Heavy Dense Fog
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
  }, [currentWeather]);

  // --- COMPONENT HANDLERS ---

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
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
      const targetCity = currentWeather.cityName || currentWeather.location;
      const isFavorite = favorites.includes(targetCity);
      if (isFavorite) {
        removeLocation(targetCity);
      } else {
        saveLocation(targetCity);
      }
    }
  };

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  // --- LOADER OVERLAY INTERFACES ---
  if (loading || locationLoading) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon loading-animation"></div>
          <p className="status-text"> Loading weather data...</p> 
        </div>
      </div>
    );
  }

  // --- ERROR OVERLAY INTERFACES ---
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

  // --- GLOBAL LAYOUT DOM TREE ---
  return (
    <div className="main-page-wrapper">
      {/* Alert banner hidden from this area to remove empty layout spacing layout gaps */}

      {/* Render active warning messages list */}
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

      {/* Input panel section text box box group wrapper */}
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

      {/* Core Meteorological Data Display Panels */}
      {currentWeather && (
        <div className="dashboard-content-stack">
          <WeatherDisplay
            weather={currentWeather}
            unit={currentUnit}
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.cityName || currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {/* Range selection navigation toggle tab rows */}
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

          {/* Conditional panel view data card injections rendering block */}
          {forecast && (
            <div className="forecast-results-container">
              {viewType === 'hourly' ? (
                <HourlyForecast 
                  weather={currentWeather} 
                  unit={currentUnit} 
                />
              ) : (
                <DailyForecast 
                  weather={currentWeather} 
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
