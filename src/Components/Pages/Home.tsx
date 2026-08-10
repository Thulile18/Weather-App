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

// Bypasses the strict local CSS declarations during compilation
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
  
  // --- APIS AND WEATHER CUSTOM HOOKS ---
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
  
  // General helper variables for clean rendering logic
  const favorites = getFavoriteLocations();
  const currentUnit = settings?.unit || 'celsius';

  // --- RECURRING APPS EFFECTS ---

  // Effect 1: Ask user for normal web notification permissions
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await NotificationService.requestPermission();
      setNotificationPermission(granted);
    };
    checkPermission();
  }, []);

  // Effect 2: Run automatic browser positioning coordinate search on load
  useEffect(() => {
    if (userLocation && !currentWeather) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, currentWeather, fetchWeatherByCoords]);

  // Effect 3: Track weather conditions to generate extreme notifications
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
      NotificationService.sendWeatherAlert(city, 'Extreme heat detected! Stay hydrated.', 'warning');
    }
    
    // Condition 2: Strong Wind advisory 
    if (currentWeather.windspeed > 15) {
      newAlerts.push({
        type: 'Wind Advisory',
        severity: 'watch',
        message: 'High winds expected. Secure outdoor objects.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'High winds expected! Secure outdoor objects.', 'watch');
    }

    // Condition 3: Subzero Freezing Temperatures
    if (currentWeather.temperature < 0) {
      newAlerts.push({
        type: 'Freeze Warning',
        severity: 'warning',
        message: 'Freezing temperatures detected. Protect plants and pipes.',
        time: new Date().toLocaleString()
      });
      NotificationService.sendWeatherAlert(city, 'Freezing temperatures! Protect plants and pipes.', 'warning');
    }

    // Condition 4: Dangerous Rainy Hot Storms
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

    // Condition 5: Heavy Dense Fog Low Visibility
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

  // --- ACTIONS HANDLERS ---

  // Triggered when searching for a town or city
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // Allows searching by pressing the keyboard Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Swaps global state preferences metrics units
  const toggleUnit = () => {
    if (settings) {
      const newUnit = settings.unit === 'celsius' ? 'fahrenheit' : 'celsius';
      updateSettings({ ...settings, unit: newUnit });
    }
  };

  // Adds or removes specific coordinates from bookmark lists
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

  // Clears a specific danger card message array index node
  const dismissAlert = (index: number) => {
    const updatedAlerts = alerts.filter((_, i) => i !== index);
    setAlerts(updatedAlerts);
  };

  // --- INTERFACE INTERRUPT LAYERS ---

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

  // --- RENDER RETURN DOM TREE ---
  return (
    <div className="main-page-wrapper">
      {/* Note: The 'Go to Settings' banner has been completely removed to clear out layout blanks */}

      {/* Render active warning messages */}
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

      {/* Search text box group row panel */}
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

      {/* Main Meteorological weather status widgets cards */}
      {currentWeather && (
        <div className="dashboard-content-stack">
          <WeatherDisplay
            weather={currentWeather}
            unit={currentUnit}
            onToggleUnit={toggleUnit}
            isFavorite={favorites.includes(currentWeather.cityName || currentWeather.location)}
            onToggleFavorite={toggleFavorite}
          />

          {/* Forecast layout segment control toggles row button view */}
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

          {/* Conditional sub components rendering */}
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
