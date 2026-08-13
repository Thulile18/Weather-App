import axios from 'axios';
import type { WeatherData, ForecastData, HourlyForecast, DailyForecast } from '../Types/Weather.types';
import { API_CONFIG } from '../Utils/Constants';

// Describes the small part of OpenWeatherMap's response shape that we
// actually use. The real response has many more fields, but we only
// need to type the ones we read.
interface OpenWeatherMapEntry {
  dt: number;
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: { description: string; icon: string }[];
  name?: string;
}

// This service is responsible for talking to the OpenWeatherMap API.
// Every function here returns data already shaped to match our own
// WeatherData / ForecastData types, so the rest of the app never has to
// worry about the raw shape that OpenWeatherMap sends back.
export class WeatherService {

  // Turns the raw response from OpenWeatherMap's "current weather" endpoint
  // into our own WeatherData shape.
  private static mapToWeatherData(city: string, data: OpenWeatherMapEntry & { name: string }): WeatherData {
    return {
      id: `${city.toLowerCase()}-${Date.now()}`,
      location: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].description,
      icon: data.weather[0].icon, // e.g. "01d" - used to pick a weather emoji
      timestamp: Date.now()
    };
  }

  static async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
        params: { q: city, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });
      return this.mapToWeatherData(city, response.data);
    } catch {
      throw new Error(`Could not find weather for "${city}". Check the spelling and try again.`);
    }
  }

  static async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
        params: { lat, lon, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });
      return this.mapToWeatherData(response.data.name, response.data);
    } catch {
      throw new Error('Failed to fetch weather data for your location.');
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast`, {
        params: { q: city, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });

      // OpenWeatherMap gives us one entry every 3 hours. We take the next
      // 8 entries (24 hours) for the hourly view.
      const forecastList: OpenWeatherMapEntry[] = response.data.list;

      const hourlyData: HourlyForecast[] = forecastList.slice(0, 8).map((item) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].description,
        icon: item.weather[0].icon
      }));

      // For the daily view we group every 3-hour entry by calendar date,
      // then work out the high and low for that day.
      const dailyMap = new Map<string, { day: string; temps: number[]; condition: string; icon: string }>();
      forecastList.forEach((item) => {
        const dateKey = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temps: [],
            condition: item.weather[0].description,
            icon: item.weather[0].icon
          });
        }
        dailyMap.get(dateKey)!.temps.push(item.main.temp);
      });

      const dailyData: DailyForecast[] = Array.from(dailyMap.values())
        .map((day) => ({
          day: day.day,
          high: Math.round(Math.max(...day.temps)),
          low: Math.round(Math.min(...day.temps)),
          condition: day.condition,
          icon: day.icon
        }))
        .slice(0, 5);

      return { hourly: hourlyData, daily: dailyData };
    } catch {
      throw new Error('Failed to fetch forecast data.');
    }
  }
}
