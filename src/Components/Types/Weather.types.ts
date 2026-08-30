export interface WeatherData {
  id: string;
  location: string;
  temperature: number;
  humidity: number;
  windspeed: number;
  condition: string;
  icon: string;
  timestamp: number;
} 

export interface ForecastData {
  hourly: HourlyForecast[];
  daily: DailyForecast[]; 
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  unit: 'celsius' | 'fahrenheit';
  favouriteLocations: string[];
} 

export interface WeatherAlert {
  type: string;
  severity: 'warning' | 'watch' | 'advisory';
  message: string;
  time: string;
}

export interface CachedWeatherEntry {
  weather: WeatherData;
  forecast: ForecastData;
  timestamp: number;
}