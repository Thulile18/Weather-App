import type { WeatherData, ForecastData, HourlyForecast, DailyForecast } from '../Types/Weather.types';
import { API_CONFIG } from '../Utils/Constants.ts';
import { getWeatherCondition } from '../Utils/Helpers';

// Small helper so every fetch call handles a failed HTTP response the
// same way, instead of repeating the same status-code checks 3 times.
const buildWeatherUrl = (endpoint: string, params: Record<string, string | number>): string => {
  const query = new URLSearchParams({
    ...params as Record<string, string>,
    appid: API_CONFIG.API_KEY,
    units: API_CONFIG.UNITS
  });
  return `${API_CONFIG.BASE_URL}/${endpoint}?${query.toString()}`;
};

export class WeatherService {

  static async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      console.log('Fetching weather for:', city);

      const response = await fetch(buildWeatherUrl('weather', { q: city }));

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling.');
        }
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your API key.');
        }
        throw new Error('Failed to fetch weather data. Please try again.');
      }

      const data = await response.json();
      console.log('Weather data received:', data);

      return {
        id: `${city.toLowerCase()}-${Date.now()}`,
        location: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windspeed: data.wind.speed, 
        condition: data.weather[0].description || getWeatherCondition(data.weather[0].id),
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  }

  static async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(buildWeatherUrl('weather', { lat, lon }));

      if (!response.ok) {
        throw new Error('Failed to fetch weather data for your location.');
      }

      const data = await response.json();

      // In very remote areas (far from any named town in the weather
      // provider's database, e.g. deep rural or farm locations), the
      // API can return an empty name. Fall back to showing the raw
      // coordinates so the location is never displayed blank.
      const resolvedName = data.name && data.name.trim().length > 0
        ? data.name
        : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

      return {
        id: `${resolvedName.toLowerCase()}-${Date.now()}`,
        location: resolvedName,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windspeed: data.wind.speed, 
        condition: data.weather[0].description || getWeatherCondition(data.weather[0].id),
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw new Error('Failed to fetch weather data for your location.');
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await fetch(buildWeatherUrl('forecast', { q: city }));

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data.');
      }

      const data = await response.json();

      const hourlyData: HourlyForecast[] = data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
      }));

      const dailyMap = new Map<string, { day: string; temps: number[]; condition: string; icon: string }>();

      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temps: [],
            condition: item.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
          });
        }
        dailyMap.get(date)!.temps.push(item.main.temp);
      });

      const dailyData: DailyForecast[] = Array.from(dailyMap.values()).map((day: any) => ({
        day: day.day,
        high: Math.max(...day.temps),
        low: Math.min(...day.temps),
        condition: day.condition,
        icon: day.icon
      })).slice(0, 5);

      return { hourly: hourlyData, daily: dailyData };
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw new Error('Failed to fetch forecast data.');
    }
  }
}