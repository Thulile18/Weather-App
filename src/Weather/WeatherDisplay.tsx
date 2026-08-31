import React from 'react';
import type { WeatherData } from '../Components/Types/Weather.types';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { formatTemperature, formatDate, capitalizeFirstLetter, getWeatherEmoji } from '../Components/Utils/Helpers';

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
  const displayCondition = capitalizeFirstLetter(weather.condition);

  return (
    <Card className="weather-card-container">
      <div className="weather-card-header">
        <div className="location-info-block">
          <h2 className="location-title">{weather.location}</h2>
          <p className="condition-subtitle">{displayCondition}</p>
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
           <span className="weather-visual-emoji">{getWeatherEmoji(weather.condition)}</span>
          </div>
          <div className="temperature-readout-block">
            <div className="temperature-text">
              {formatTemperature(weather.temperature, unit)}
            </div>
            <div className="condition-text">{displayCondition}</div>
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
          Last updated: {formatDate(weather.timestamp)}
        </p>
      </div>
    </Card>
  );
};

export default WeatherDisplay;