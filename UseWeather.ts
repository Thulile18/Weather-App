import { useContext, createContext } from 'react';
import type { WeatherData, ForecastData, UserSettings, WeatherAlert } from '../Types/Weather.types';

export interface WeatherContextValue {
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  settings: UserSettings | null;
  fetchWeather: (location: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  updateSettings: (newSettings: UserSettings) => void;
  saveLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  getFavoriteLocations: () => string[];
  dismissAlert: (alertType: string) => void;
}

// React Context lets every page (Home, Favourites, Settings) share the
// exact same weather data and settings, instead of each page fetching
// and storing its own separate copy. WeatherProvider (in
// Context/WeatherContext.tsx) fills this context with real values.
export const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

// The hook every page uses to read and update weather data/settings.
// It must be used inside a <WeatherProvider>, which App.tsx sets up
// once at the top of the app.
export const useWeather = (): WeatherContextValue => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used inside a <WeatherProvider>');
  }
  return context;
};
