import axios from 'axios';
import type { WeatherData, ForecastData, HourlyForecast, DailyForecast } from '../Types/Weather.types';
import { API_CONFIG } from '../Utils/Constants.ts';

// GLOBAL FLAGS CONTROL - Set to true to bypass OpenWeather entirely on deployment failures
const USE_MOCK = true;

export class WeatherService {
  
  static async getWeatherByCity(city: string): Promise<WeatherData> {
    if (USE_MOCK) {
      console.log('Using mock data for city search:', city);
      return {
        id: `${city.toLowerCase()}-${Date.now()}`,
        location: city.charAt(0).toUpperCase() + city.slice(1),
        temperature: 22,
        humidity: 65,
        windSpeed: 4.5, // Matches service model mapping structure
        windspeed: 4.5, // Matches the Home.tsx strict lowercase warning check layout
        condition: 'scattered clouds',
        icon: 'https://openweathermap.org',
        timestamp: Date.now()
      };
    }

    try {
      console.log('Fetching weather for:', city);
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_CONFIG.API_KEY,
          units: API_CONFIG.UNITS
        }
      });

      console.log('Weather data received:', response.data);
      const data = response.data;

      return {
        id: `${city.toLowerCase()}-${Date.now()}`,
        location: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windspeed: data.wind.speed,
        condition: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (error.response?.status === 404) {
          throw new Error('City not found. Please check the spelling.');
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your API key.');
        }
      }
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  }

  static async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    if (USE_MOCK) {
      console.log('Using mock data for geolocation coords:', lat, lon);
      return {
        id: `local-coords-${Date.now()}`,
        location: 'Current Location',
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
        params: {
          lat,
          lon,
          appid: API_CONFIG.API_KEY,
          units: API_CONFIG.UNITS
        }
      });

      const data = response.data;

      return {
        id: `${data.name.toLowerCase()}-${Date.now()}`,
        location: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windspeed: data.wind.speed,
        condition: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw new Error('Failed to fetch weather data for your location.');
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    if (USE_MOCK) {
      console.log('Using mock data for tabular forecasts:', city);
      
      const mockHourly: HourlyForecast[] = [
        { time: '08:00 AM', temperature: 18, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { time: '11:00 AM', temperature: 21, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { time: '02:00 PM', temperature: 24, condition: 'scattered clouds', icon: 'https://openweathermap.org' },
        { time: '05:00 PM', temperature: 22, condition: 'scattered clouds', icon: 'https://openweathermap.org' },
        { time: '08:00 PM', temperature: 19, condition: 'few clouds', icon: 'https://openweathermap.org' },
        { time: '11:00 PM', temperature: 16, condition: 'clear sky', icon: 'https://openweathermap.org' }
      ];

      const mockDaily: DailyForecast[] = [
        { day: 'Mon', high: 24, low: 14, condition: 'clear sky', icon: 'https://openweathermap.org' },
        { day: 'Tue', high: 26, low: 15, condition: 'few clouds', icon: 'https://openweathermap.org' },
        { day: 'Wed', high: 23, low: 13, condition: 'scattered clouds', icon: 'https://openweathermap.org' },
        { day: 'Thu', high: 21, low: 12, condition: 'light rain', icon: 'https://openweathermap.org' },
        { day: 'Fri', high: 22, low: 14, condition: 'clear sky', icon: 'https://openweathermap.org' }
      ];

      return { hourly: mockHourly, daily: mockDaily };
    }

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_CONFIG.API_KEY,
          units: API_CONFIG.UNITS
        }
      });

      const hourlyData: HourlyForecast[] = response.data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
      }));

      const dailyMap = new Map<string, { day: string; temps: number[]; condition: string; icon: string }>();
      
      response.data.list.forEach((item: any) => {
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

