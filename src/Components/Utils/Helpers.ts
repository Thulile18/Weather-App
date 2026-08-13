import type { WeatherData } from '../Types/Weather.types';
import { CACHE_DURATION } from './Constants'; 

export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit'): string => {
  const value = unit === 'celsius' ? temp : (temp * 9 / 5) + 32;
  return `${value.toFixed(1)}°${unit === 'celsius' ? 'C' : 'F'}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getWeatherCondition = (code: number): string => {
  const conditions: { [key: number]: string } = {
    200: 'Thunderstorm with light rain',
    201: 'Thunderstorm with rain',
    202: 'Thunderstorm with heavy rain',
    210: 'Light thunderstorm',
    211: 'Thunderstorm',
    212: 'Heavy thunderstorm',
    221: 'Ragged thunderstorm',
    230: 'Thunderstorm with light drizzle',
    231: 'Thunderstorm with drizzle',
    232: 'Thunderstorm with heavy drizzle',
    300: 'Light drizzle',
    301: 'Drizzle',
    302: 'Heavy drizzle',
    310: 'Light drizzle rain',
    311: 'Drizzle rain',
    312: 'Heavy drizzle rain',
    313: 'Shower rain and drizzle',
    314: 'Heavy shower rain and drizzle',
    321: 'Shower drizzle',
    500: 'Light rain',
    501: 'Moderate rain',
    502: 'Heavy rain',
    503: 'Very heavy rain',
    504: 'Extreme rain',
    511: 'Freezing rain',
    520: 'Light shower rain',
    521: 'Shower rain',
    522: 'Heavy shower rain',
    531: 'Ragged shower rain',
    600: 'Light snow',
    601: 'Snow',
    602: 'Heavy snow',
    611: 'Sleet',
    612: 'Light shower sleet',
    613: 'Shower sleet',
    615: 'Light rain and snow',
    616: 'Rain and snow',
    620: 'Light shower snow',
    621: 'Shower snow',
    622: 'Heavy shower snow',
    701: 'Mist',
    711: 'Smoke',
    721: 'Haze',
    731: 'Sand/dust whirls',
    741: 'Fog',
    751: 'Sand',
    761: 'Dust',
    762: 'Volcanic ash',
    771: 'Squalls',
    781: 'Tornado',
    800: 'Clear sky',
    801: 'Few clouds',
    802: 'Scattered clouds',
    803: 'Broken clouds',
    804: 'Overcast clouds'
  };
  return conditions[code] || 'Unknown Weather';
};

export const isWeatherDataExpired = (data: WeatherData): boolean => {
  return Date.now() - data.timestamp > CACHE_DURATION;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getWeatherIconUrl = (): string => {
  return `https://openweathermap.org{iconCode}@2x.png`;
};
