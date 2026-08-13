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
  unit: 'celsius' | 'fahrenheit';
}

const DailyForecast: React.FC<DailyForecastProps> = ({ forecasts, unit }) => {
  const getTemperature = (tempCelsius: number) => {
    return unit === 'celsius' ? tempCelsius : (tempCelsius * 9) / 5 + 32;
  };
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';

  return (
    <Card className="daily-forecast-container">
      <h3 className="daily-forecast-title">5-Day Forecast</h3>

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
                {getTemperature(forecast.high).toFixed(0)}°
              </span>
              <span className="temp-divider">/</span>
              <span className="temp-low-readout">
                {getTemperature(forecast.low).toFixed(0)}°{unitSymbol}
              </span>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
};

export default DailyForecast;
