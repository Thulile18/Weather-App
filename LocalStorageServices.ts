import type { UserSettings, WeatherData, ForecastData } from '../Types/Weather.types';

const OFFLINE_CACHE_KEY = 'weather_offline_cache';

interface CachedWeather {
  weather: WeatherData;
  forecast: ForecastData;
  cachedAt: number;
}

export class WeatherStorageService {
  
  getSettings(): UserSettings {
    const data = localStorage.getItem('weather_app_settings');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // If the saved settings are corrupted, fall through and use defaults.
      }
    }
    
    return {
      theme: 'light',
      unit: 'celsius',
      favouriteLocations: ['London', 'Cape Town']
    };
  }

  saveSettings(settings: UserSettings): void {
    localStorage.setItem('weather_app_settings', JSON.stringify(settings));
  }

  addFavoriteCity(city: string): void {
    const currentSettings = this.getSettings();
    
    const exists = currentSettings.favouriteLocations.some(
      (existingCity: string) => existingCity.toLowerCase() === city.toLowerCase()
    );
    
    if (!exists) {
      currentSettings.favouriteLocations.push(city);
      this.saveSettings(currentSettings);
    }
  }

  removeFavoriteCity(city: string): void {
    const currentSettings = this.getSettings();
    
    currentSettings.favouriteLocations = currentSettings.favouriteLocations.filter(
      (existingCity: string) => existingCity.toLowerCase() !== city.toLowerCase()
    );
    
    this.saveSettings(currentSettings);
  }

  // Saves the most recent weather + forecast for a location so it can
  // still be shown if the user opens the app without a connection.
  cacheWeather(locationKey: string, weather: WeatherData, forecast: ForecastData): void {
    const allCached = this.getAllCachedWeather();
    allCached[locationKey.toLowerCase()] = { weather, forecast, cachedAt: Date.now() };
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(allCached));
  }

  getCachedWeather(locationKey: string): CachedWeather | null {
    const allCached = this.getAllCachedWeather();
    return allCached[locationKey.toLowerCase()] || null;
  }

  private getAllCachedWeather(): Record<string, CachedWeather> {
    const data = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
}