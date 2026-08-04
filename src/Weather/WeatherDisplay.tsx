import React from 'react';
import type { WeatherData } from '../Components/Types/Weather.types';
import Button from '../Components/Button';
import Card from '../Components/Card';

interface WeatherDisplayProps {
  weather: WeatherData;
  unit: 'celsius' | 'fahrenheit'; 
  onToggleUnit?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ 
  weather, 
  unit, 
  onToggleUnit,
  isFavorite = false,
  onToggleFavorite
}) => {
  const temperature = unit === 'celsius' 
    ? weather.temperature 
    : (weather.temperature * 9 / 5) + 32;

  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <Card className="weather-card-container">
      <div className="weather-card-header">
        <div className="location-info-block">
          <h2 className="location-title">{weather.location}</h2>
          <p className="condition-subtitle">{weather.condition}</p>
        </div>
        
        <div className="card-action-buttons">
          {onToggleFavorite && (
            <Button
              onClick={onToggleFavorite}
              variant={isFavorite ? 'primary' : 'secondary'}
              size="sm"
            >
              {isFavorite ? ' Saved' : ' Save'}
            </Button>
          )}
          {onToggleUnit && (
            <Button
              onClick={onToggleUnit}
              variant="secondary"
              size="sm"
            >
              {unit === 'celsius' ? '°F' : '°C'}
            </Button>
          )}
        </div>
      </div>

      <div className="weather-card-body">
        <div className="primary-metrics">
          <div className="icon-wrapper-zoom">
            <span className="weather-visual-emoji"></span>
          </div>
          <div className="temperature-readout-block">
            <div className="temperature-text">
              {temperature.toFixed(1)}{unitSymbol}
            </div>
            <div className="condition-text">{weather.condition}</div>
          </div>
        </div>

        <div className="secondary-stats">
          <div className="stat-item-row">
            <span className="stat-label"> Humidity </span>
            <span className="stat-value">{weather.humidity}%</span>
          </div>
          <div className="stat-item-row">
            <span className="stat-label"> Wind </span>
            <span className="stat-value">{weather.windspeed} m/s</span>
          </div>
        </div>
      </div>

      <div className="weather-card-footer">
        <p className="timestamp-label">
          Last updated: {new Date(weather.timestamp).toLocaleString()}
        </p>
      </div>
    </Card>
  );
};

export default WeatherDisplay;