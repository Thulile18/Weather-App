import type { WeatherData, WeatherAlert } from '../Types/Weather.types';
import { CACHE_DURATION } from './Constants';

// Converts a Celsius value into a nicely formatted string in whichever
// unit the user has chosen, e.g. "21.0°C" or "69.8°F".
export const formatTemperature = (tempCelsius: number, unit: 'celsius' | 'fahrenheit'): string => {
  const value = unit === 'celsius' ? tempCelsius : (tempCelsius * 9) / 5 + 32;
  return `${value.toFixed(1)}°${unit === 'celsius' ? 'C' : 'F'}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// OpenWeatherMap gives a numeric weather code (e.g. 800 = clear sky).
// This is only used if we ever work with the numeric code directly.
export const getWeatherCondition = (code: number): string => {
  const conditions: { [key: number]: string } = {
    200: 'Thunderstorm with light rain',
    201: 'Thunderstorm with rain',
    202: 'Thunderstorm with heavy rain',
    300: 'Light drizzle',
    301: 'Drizzle',
    500: 'Light rain',
    501: 'Moderate rain',
    502: 'Heavy rain',
    600: 'Light snow',
    601: 'Snow',
    701: 'Mist',
    741: 'Fog',
    800: 'Clear sky',
    801: 'Few clouds',
    802: 'Scattered clouds',
    803: 'Broken clouds',
    804: 'Overcast clouds'
  };
  return conditions[code] || 'Unknown weather';
};

// Picks a simple emoji to represent the current weather condition.
// Using emoji keeps things simple and beginner-friendly - no broken
// image URLs or extra network requests needed just to show an icon.
export const getWeatherEmoji = (condition: string): string => {
  const text = condition.toLowerCase();

  if (text.includes('thunder')) return '⛈️';
  if (text.includes('drizzle')) return '🌦️';
  if (text.includes('rain')) return '🌧️';
  if (text.includes('snow')) return '❄️';
  if (text.includes('mist') || text.includes('fog') || text.includes('haze') || text.includes('smoke')) return '🌫️';
  if (text.includes('clear')) return '☀️';
  if (text.includes('few clouds')) return '🌤️';
  if (text.includes('scattered clouds')) return '⛅';
  if (text.includes('cloud')) return '☁️';

  return '🌡️';
};

export const isWeatherDataExpired = (data: WeatherData): boolean => {
  return Date.now() - data.timestamp > CACHE_DURATION;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Looks at the current weather and works out if any conditions are
// severe enough to warn the user about. Kept as plain, readable checks
// so it is easy to add more rules later.
export const generateWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  const time = formatTime(Date.now());

  if (weather.temperature >= 35) {
    alerts.push({
      type: 'Extreme Heat',
      severity: 'warning',
      message: `Temperature in ${weather.location} has reached ${weather.temperature}°C. Stay hydrated and avoid direct sun.`,
      time
    });
  }

  if (weather.temperature <= 0) {
    alerts.push({
      type: 'Freezing Conditions',
      severity: 'watch',
      message: `Temperature in ${weather.location} has dropped to ${weather.temperature}°C. Watch out for icy surfaces.`,
      time
    });
  }

  if (weather.windSpeed >= 15) {
    alerts.push({
      type: 'Strong Wind',
      severity: 'watch',
      message: `Wind speeds near ${weather.location} are unusually high at ${weather.windSpeed} m/s.`,
      time
    });
  }

  if (weather.humidity >= 90) {
    alerts.push({
      type: 'High Humidity',
      severity: 'advisory',
      message: `Humidity in ${weather.location} is very high at ${weather.humidity}%.`,
      time
    });
  }

  if (weather.condition.toLowerCase().includes('storm')) {
    alerts.push({
      type: 'Thunderstorm',
      severity: 'warning',
      message: `A thunderstorm has been reported in ${weather.location}. Stay indoors if possible.`,
      time
    });
  }

  return alerts;
};
