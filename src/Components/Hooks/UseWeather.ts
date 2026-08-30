import { useState, useEffect, useCallback } from 'react';
import type { WeatherData, ForecastData, UserSettings } from '../Types/Weather.types';
import { WeatherService } from '../Services/WeatherService';
import { WeatherStorageService } from '../Services/LocalStorageServices';

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const storage = new WeatherStorageService();

  useEffect(() => {
    const savedSettings = storage.getSettings();
    setSettings(savedSettings);
  }, []);

  const fetchWeather = useCallback(async (location: string) => {
    setLoading(true);
    setError(null);

    try {
      const weatherData = await WeatherService.getWeatherByCity(location);
      setCurrentWeather(weatherData);

      const forecastData = await WeatherService.getForecast(location);
      setForecast(forecastData);

      storage.cacheWeather(weatherData, forecastData);

    } catch (err) {
      
      const cached = storage.getCachedWeather(location);
      if (cached) {
        setCurrentWeather(cached.weather);
        setForecast(cached.forecast);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to retrieve cloud metrics.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      const weatherData = await WeatherService.getWeatherByCoords(lat, lon);
      setCurrentWeather(weatherData);

      const forecastData = await WeatherService.getForecast(weatherData.location);
      setForecast(forecastData);

      storage.cacheWeather(weatherData, forecastData);

    } catch (err) {
      const cached = storage.getCachedWeather();
      if (cached) {
        setCurrentWeather(cached.weather);
        setForecast(cached.forecast);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to locate regional atmospheric targets.');
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
    if (settings) {
      setSettings({
        ...settings,
        favouriteLocations: [...settings.favouriteLocations, location]
      });
    }
  }, [settings]);

  const removeLocation = useCallback((location: string) => {
    storage.removeFavoriteCity(location);
    if (settings) {
      setSettings({
        ...settings,
        favouriteLocations: settings.favouriteLocations.filter((loc: string) => loc !== location)
      });
    }
  }, [settings]);

  const getFavoriteLocations = useCallback(() => {
    return settings?.favouriteLocations || [];
  }, [settings]);

  return {
    currentWeather,
    forecast,
    loading,
    error,
    settings,
    fetchWeather,
    fetchWeatherByCoords,
    updateSettings,
    saveLocation,
    removeLocation,
    getFavoriteLocations
  };
};