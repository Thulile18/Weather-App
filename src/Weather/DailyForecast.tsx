import React from 'react';
import Card from '../Components/Card';
import { getWeatherEmoji } from '../Components/Utils/Helpers';

export interface DailyForecastData {
  day: string;
  condition: string;
  high: number;
  low: number;
}

interface DailyForecastProps {
  forecasts: DailyForecastData[];
  unit: 'C' | 'F'; 
}

const DailyForecast: React.FC<DailyForecastProps> = ({ forecasts, unit }) => {
  const getTemperature = (temp: number) => {
    return unit === 'C' ? temp : (temp * 9 / 5) + 32;
  };

  return (
    <Card className="daily-forecast-container">
      <h3 className="daily-forecast-title"> 7-Day Forecast </h3>
      
      <div className="vertical-stack-rows">
        {forecasts.map((forecast, index) => (
          <div key={index} className="forecast-row-item">
            
            <div className="forecast-left-content">
              <span className="forecast-day-label">{forecast.day}</span>
              <div className="forecast-emoji-box">{getWeatherEmoji(forecast.condition)}</div>
              <span className="forecast-condition-text">{forecast.condition}</span>
            </div>
            
            <div className="forecast-right-temperatures">
              <span className="temp-high-readout">
                {getTemperature(forecast.high).toFixed(1)}°
              </span>
              <span className="temp-divider">/</span>
              <span className="temp-low-readout">
                {getTemperature(forecast.low).toFixed(1)}°{unit}
              </span>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
};

export default DailyForecast;
