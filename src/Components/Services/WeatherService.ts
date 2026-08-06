import axios from 'axios';
import type { WeatherData, ForecastData, HourlyForecast, DailyForecast, WeatherAlert } from '../Types/Weather.types';

const API_KEY = '8bb16bb5510615456144f052661fbf80';
const BASE_URL = 'https://openweathermap.org';

export class WeatherService {
  
  static async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });

      return {
        id: `${city.toLowerCase()}-${Date.now()}`,
        location: response.data.name,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        windspeed: response.data.wind.speed, 
        condition: response.data.weather[0].description,
        icon: `https://openweathermap.org{response.data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('City not found. Please check your spelling.');
      }
      throw new Error('Failed to fetch current weather data. Please try again.');
    }
  }

  static async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });

      return {
        id: `${response.data.name.toLowerCase()}-${Date.now()}`,
        location: response.data.name,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        windspeed: response.data.wind.speed, 
        condition: response.data.weather[0].description,
        icon: `https://openweathermap.org{response.data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error: any) {
      throw new Error('Failed to fetch weather data for your current location coordinates.');
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const hourlyData: HourlyForecast[] = response.data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: `https://openweathermap.org{item.weather[0].icon}.png`
      }));

      const dailyMap = new Map<string, { day: string; temps: number[]; condition: string; icon: string }>();
      
      response.data.list.forEach((item: any) => {
        const dateKey = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            day: new Date(item.dt * 1000).toLocaleDateString('en-ZA', { weekday: 'short' }),
            temps: [],
            condition: item.weather[0].description,
            icon: `https://openweathermap.org{item.weather[0].icon}.png`
          });
        }
        dailyMap.get(dateKey)!.temps.push(item.main.temp);
      });

      const dailyData: DailyForecast[] = Array.from(dailyMap.values()).map((day) => ({
        day: day.day,
        high: Math.max(...day.temps),
        low: Math.min(...day.temps),
        condition: day.condition,
        icon: day.icon
      })).slice(0, 5);

      return { hourly: hourlyData, daily: dailyData };
    } catch (error: any) {
      throw new Error('Failed to retrieve atmospheric forecast data timelines.');
    }
  }

  static getMockAlerts(condition: string): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const normalizedCondition = condition.toLowerCase();

    if (normalizedCondition.includes('storm') || normalizedCondition.includes('thunder')) {
      alerts.push({
        type: 'Severe Thunderstorm Warning',
        severity: 'warning',
        message: 'Severe thunderstorms detected in the local area. Threat of flash flooding.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    return alerts;
  }
}
