import React from 'react';
import { useWeather } from '../Hooks/UseWeather'; 
import Button from '../Button';
import Card from '../Card';
import { Link } from 'react-router-dom'; 

const Settings: React.FC = () => {
  const { settings, updateSettings } = useWeather();

  if (!settings) {
    return <div className="status-label-text"> Retrieving user profiles... </div>;
  }

  const handleToggleTheme = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };

  const handleToggleUnit = () => {
    updateSettings({
      ...settings,
      unit: settings.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    });
  };

  return (
    <div className="settings-page-wrapper">
      <h2 className="settings-section-heading"> App Preferences Configuration </h2>
      
      <div className="settings-vertical-stack">
        
        <Card className="settings-control-card">
          <div className="settings-item-row-layout">
            <div className="settings-text-meta-block">
              <h3 className="settings-item-title"> Color Theme Style </h3>
              <p className="settings-item-description">
                Currently Active: <strong>{settings.theme === 'light' ? ' Light Mode' : ' Dark Mode'}</strong>
              </p>
            </div>
            <Button onClick={handleToggleTheme} variant="secondary" size="sm">
              Change Style
            </Button>
          </div>
        </Card>

        <Card className="settings-control-card">
          <div className="settings-item-row-layout">
            <div className="settings-text-meta-block">
              <h3 className="settings-item-title"> Temperature Measurement Unit </h3>
              <p className="settings-item-description">
                Currently Active: <strong>{settings.unit === 'celsius' ? '°C Celsius Scale' : '°F Fahrenheit Scale'}</strong>
              </p>
            </div>
            <Button onClick={handleToggleUnit} variant="secondary" size="sm">
              Switch Scales
            </Button>
          </div>
        </Card>

        <Card className="settings-control-card">
          <div className="settings-item-row-layout">
            <div className="settings-text-meta-block">
              <h3 className="settings-item-title"> Your Pin Portfolio </h3>
              <p className="settings-item-description">
                You have logged <strong>{settings.favouriteLocations.length} locations</strong> in browser memory
              </p>
            </div>
            <Link to="/favorites">
              <Button variant="primary" size="sm">
                Manage Portfolio
              </Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Settings;