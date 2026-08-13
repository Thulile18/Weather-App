import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherData, ForecastData, UserSettings, WeatherAlert } from '../Types/Weather.types';
import { WeatherService } from '../Services/WeatherService';
import { WeatherStorageService } from '../Services/LocalStorageServices';
import { generateWeatherAlerts } from '../Utils/Helpers';
import { NotificationService } from '../Utils/Notifications';
import { WeatherContext } from '../Hooks/UseWeather';
import type { WeatherContextValue } from '../Hooks/UseWeather';

// A single instance of the storage service is reused everywhere,
// instead of creating a new one every time a component renders.
const storage = new WeatherStorageService();

// The key used to cache weather fetched from the user's coordinates,
// separate from weather cached by city name.
const CURRENT_LOCATION_CACHE_KEY = 'current-location';

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Load the user's saved settings (theme, unit, favourite locations)
  // once, when the app first starts up.
  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  // Runs whenever a fresh weather reading comes in: works out if any
  // weather alerts apply, and lets the browser notify the user about them.
  const handleNewWeather = (weatherData: WeatherData) => {
    const newAlerts = generateWeatherAlerts(weatherData);
    setAlerts(newAlerts);
    newAlerts.forEach((alert) => {
      NotificationService.sendWeatherAlert(weatherData.location, alert.message, alert.severity);
    });
  };

  const fetchWeather = useCallback(async (location: string) => {
    setLoading(true);
    setError(null);
    setIsOffline(false);

    try {
      const weatherData = await WeatherService.getWeatherByCity(location);
      const forecastData = await WeatherService.getForecast(location);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      handleNewWeather(weatherData);
      storage.cacheWeather(weatherData.location, weatherData, forecastData);
    } catch (err) {
      // No internet or the API failed - fall back to the last saved
      // reading for this location, if we have one.
      const cached = storage.getCachedWeather(location);
      if (cached) {
        setCurrentWeather(cached.weather);
        setForecast(cached.forecast);
        setIsOffline(true);
        setError('You appear to be offline. Showing the last saved forecast for this location.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to retrieve weather data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setIsOffline(false);

    try {
      const weatherData = await WeatherService.getWeatherByCoords(lat, lon);
      const forecastData = await WeatherService.getForecast(weatherData.location);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      handleNewWeather(weatherData);
      storage.cacheWeather(CURRENT_LOCATION_CACHE_KEY, weatherData, forecastData);
    } catch (err) {
      const cached = storage.getCachedWeather(CURRENT_LOCATION_CACHE_KEY);
      if (cached) {
        setCurrentWeather(cached.weather);
        setForecast(cached.forecast);
        setIsOffline(true);
        setError('You appear to be offline. Showing the last saved forecast for your location.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to detect weather for your location.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: UserSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const saveLocation = useCallback((location: string) => {
    storage.addFavoriteCity(location);
    setSettings(storage.getSettings());
  }, []);

  const removeLocation = useCallback((location: string) => {
    storage.removeFavoriteCity(location);
    setSettings(storage.getSettings());
  }, []);

  const getFavoriteLocations = useCallback((): string[] => {
    return settings?.favouriteLocations || [];
  }, [settings]);

  const dismissAlert = useCallback((alertType: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.type !== alertType));
  }, []);

  const value: WeatherContextValue = {
    currentWeather,
    forecast,
    alerts,
    loading,
    error,
    isOffline,
    settings,
    fetchWeather,
    fetchWeatherByCoords,
    updateSettings,
    saveLocation,
    removeLocation,
    getFavoriteLocations,
    dismissAlert
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};
