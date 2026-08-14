import type { UserSettings } from '../Types/Weather.types';

export class WeatherStorageService {
  
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
