import type { UserSettings, WeatherData, ForecastData, CachedWeatherEntry } from '../Types/Weather.types';

export class WeatherStorageService {

  // Saves the most recently fetched weather so it can still be shown
  // when the user is offline or a network request fails. We store it
  // both under the specific city name and under a generic "last" key,
  // so we always have something to fall back to even if the city name
  // the user searched for doesn't exactly match a saved entry.
  cacheWeather(weather: WeatherData, forecast: ForecastData): void {
    const cacheEntry: CachedWeatherEntry = {
      weather,
      forecast,
      timestamp: Date.now()
    };
    const entryJson = JSON.stringify(cacheEntry);
    localStorage.setItem(`weather_cache_${weather.location.toLowerCase()}`, entryJson);
    localStorage.setItem('weather_cache_last', entryJson);
  }

  getCachedWeather(location?: string): CachedWeatherEntry | null {
    if (location) {
      const specific = localStorage.getItem(`weather_cache_${location.toLowerCase()}`);
      if (specific) {
        try {
          return JSON.parse(specific);
        } catch (e) {
          // fall through to the generic cache below
        }
      }
    }

    const last = localStorage.getItem('weather_cache_last');
    if (last) {
      try {
        return JSON.parse(last);
      } catch (e) {
        return null;
      }
    }

    return null;
  }

  getSettings(): UserSettings {
    const data = localStorage.getItem('weather_app_settings');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
       
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
}