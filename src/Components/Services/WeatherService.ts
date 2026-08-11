import axios from 'axios';
import type { WeatherData, ForecastData, HourlyForecast, DailyForecast } from '../Types/Weather.types';
import { API_CONFIG } from '../Utils/Constants.ts';

// GLOBAL MOCK CONTROLLER - Set to true to ensure immediate reliable loading on Vercel
const USE_MOCK = false;

export class WeatherService {
  
  static async getWeatherByCity(city: string): Promise<any> {
    if (USE_MOCK) {
      const cleanName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      console.log('Using mock data for city search:', cleanName);
      return {
        id: `${cleanName.toLowerCase()}-${Date.now()}`,
        location: cleanName,
        cityName: cleanName, // Fixes hook save locations mapping references
        temperature: 22,
        humidity: 65,
        windSpeed: 4.5,
        windspeed: 4.5, // Prevents warning alerts crashing calculations
        condition: 'scattered clouds',
        icon: 'https://openweathermap.org',
        timestamp: Date.now()
      };
    }

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
        params: { q: city, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });
      const data = response.data;
      return {
        id: `${city.toLowerCase()}-${Date.now()}`,
        location: data.name,
        cityName: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windspeed: data.wind.speed,
        condition: data.weather[0].description,
        icon: `https://openweathermap.org{data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error('Failed to fetch weather data.');
    }
  }

  static async getWeatherByCoords(lat: number, lon: number): Promise<any> {
    if (USE_MOCK) {
      return {
        id: `local-coords-${Date.now()}`,
        location: 'Johannesburg',
        cityName: 'Johannesburg',
        temperature: 18,
        humidity: 70,
        windSpeed: 3.2,
        windspeed: 3.2,
        condition: 'clear sky',
        icon: 'https://openweathermap.org',
        timestamp: Date.now()
      };
    }

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
        params: { lat, lon, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });
      const data = response.data;
      return {
        id: `${data.name.toLowerCase()}-${Date.now()}`,
        location: data.name,
        cityName: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windspeed: data.wind.speed,
        condition: data.weather[0].description,
        icon: `https://openweathermap.org{data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error('Failed to fetch weather data for your location.');
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    if (USE_MOCK) {
      const mockHourly: HourlyForecast[] = [
        { time: '08:00 AM', temperature: 18, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { time: '11:00 AM', temperature: 21, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { time: '02:00 PM', temperature: 24, condition: 'scattered clouds', icon: 'https://openweathermap.org' },
        { time: '05:00 PM', temperature: 22, condition: 'scattered clouds', icon: 'https://openweathermap.org' }
      ];

      const mockDaily: DailyForecast[] = [
        { day: 'Mon', high: 24, low: 14, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { day: 'Tue', high: 26, low: 15, condition: 'few clouds', icon: 'https://openweathermap.org' },
        { day: 'Wed', high: 23, low: 13, condition: 'scattered clouds', icon: 'https://openweathermap.org' }
      ];

      return { hourly: mockHourly, daily: mockDaily };
    }

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast`, {
        params: { q: city, appid: API_CONFIG.API_KEY, units: API_CONFIG.UNITS }
      });
      const hourlyData = response.data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: `https://openweathermap.org{item.weather[0].icon}.png`
      }));

      const dailyMap = new Map<string, { day: string; temps: number[]; condition: string; icon: string }>();
      response.data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temps: [],
            condition: item.weather[0].description,
            icon: `https://openweathermap.org{item.weather[0].icon}.png`
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
      throw new Error('Failed to fetch forecast data.');
    }
  }
}
