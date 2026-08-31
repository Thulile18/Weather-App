import React from 'react';
import Card from '../Components/Card';
import { getWeatherEmoji } from '../Components/Utils/Helpers';

export interface HourlyForecastData {
  time: string;
  temperature: number;
  condition: string;
}

interface HourlyForecastProps {
  forecasts: HourlyForecastData[];
  unit: 'C' | 'F'; 
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ forecasts, unit }) => {
  const getTemperature = (temp: number) => {
    return unit === 'C' ? temp : (temp * 9 / 5) + 32;
  };

  return (
    <Card className="forecast-card-wrapper">
      <h3 className="forecast-section-title"> Hourly Forecast </h3>
      
      <div className="horizontal-scroll-viewport">
        <div className="scroll-flex-track">
          {forecasts.map((forecast, index) => (
            <div key={index} className="forecast-column-node">
              <div className="node-time-header">{forecast.time}</div>
              
              <div className="node-icon-visual-box">{getWeatherEmoji(forecast.condition)}</div>
              
              <div className="node-temperature-readout">
                {getTemperature(forecast.temperature).toFixed(1)}°{unit}
              </div>
              
              <div className="node-condition-label" title={forecast.condition}>
                {forecast.condition}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default HourlyForecast;

