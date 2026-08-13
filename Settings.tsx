import React from 'react';
import { useWeather } from '../Hooks/UseWeather';
import Button from '../Button';
import Card from '../Card';
import { Link } from 'react-router-dom';
import { NotificationService } from '../Utils/Notifications.ts';
import './Settings.css'; 

const Settings: React.FC = () => {
  const { settings, updateSettings } = useWeather();

  if (!settings) return null;

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };

  const toggleUnit = () => {
    updateSettings({
      ...settings,
      unit: settings.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    });
  };

  const requestNotificationPermission = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      alert('Notifications enabled! You will receive weather alerts.');
    } else {
      alert('Please allow notifications in your browser settings to receive weather alerts.');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      localStorage.clear();
      alert('All data cleared! The page will now refresh.');
      window.location.reload();
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-heading"> Settings </h2>
      
      <div className="settings-wrapper">
        <Card>
          <div className="settings-item-row">
            <div className="settings-text-group">
              <h3 className="settings-item-title"> Theme </h3>
              <p className="settings-info-text">
                Currently: {settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
            </div>
            <Button onClick={toggleTheme} variant="secondary" size="sm">
              {settings.theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="settings-item-row">
            <div className="settings-text-group">
              <h3 className="settings-item-title"> Temperature Unit </h3>
              <p className="settings-info-text">
                Currently: {settings.unit === 'celsius' ? '°C Celsius' : '°F Fahrenheit'}
              </p>
            </div>
            <Button onClick={toggleUnit} variant="secondary" size="sm">
              Switch to {settings.unit === 'celsius' ? '°F' : '°C'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="settings-item-row">
            <div className="settings-text-group">
              <h3 className="settings-item-title"> Weather Alerts </h3>
              <p className="settings-info-text">
                {'Notification' in window && Notification.permission === 'granted' 
                  ? 'Notifications enabled' 
                  : 'Notifications disabled'}
              </p>
              <p className="settings-sub-text">
                Receive push notifications for severe weather alerts
              </p>
            </div>
            <Button 
              onClick={requestNotificationPermission} 
              variant="primary" 
              size="sm"
            >
              {'Notification' in window && Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="settings-item-row">
            <div className="settings-text-group">
              <h3 className="settings-item-title"> Favorite Locations </h3>
              <p className="settings-info-text">
                {settings.favouriteLocations.length} locations saved
              </p>
              {settings.favouriteLocations.length > 0 && (
                <div className="favorite-chips-container">
                  {settings.favouriteLocations.map((loc: string, index: number) => (
                    <span key={index} className="favorite-chip">
                      {loc}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link to="/favourites">
              <Button variant="primary" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="settings-text-group">
            <h3 className="settings-item-title"> About </h3>
            <p className="settings-info-text"> Weather App </p>
            <p className="settings-sub-text">
              Built with React, TypeScript, and Pure Vanilla CSS
            </p>
            <p className="settings-sub-text">
              Data provided by OpenWeatherMap
            </p>
          </div>
        </Card>

        <Card className="danger-zone-card">
          <div className="settings-item-row">
            <div className="settings-text-group">
              <h3 className="settings-item-title danger-title"> Danger Zone </h3>
              <p className="settings-info-text">
                Clear all saved data from localStorage
              </p>
            </div>
            <Button onClick={clearAllData} variant="danger" size="sm">
              Clear All Data
            </Button>
          </div>
        </Card>

        <div className="back-button-row">
          <Link to="/">
            <Button variant="secondary"> Back to Home </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;