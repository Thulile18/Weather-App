export const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: 'YOUR_API_KEY_HERE', 
  UNITS: 'metric'
};

export const WEATHER_ICONS = {
  CLEAR: '01d',
  FEW_CLOUDS: '02d',
  SCATTERED_CLOUDS: '03d',
  BROKEN_CLOUDS: '04d',
  SHOWER_RAIN: '09d',
  RAIN: '10d',
  THUNDERSTORM: '11d',
  SNOW: '13d',
  MIST: '50d'
};

export const STORAGE_KEYS = {
  WEATHER_DATA: 'weather_data',
  USER_SETTINGS: 'user_settings'
};

export const CACHE_DURATION = 600000; 

export const BREAKPOINTS = {
  XS: 320,
  SM: 480,
  MD: 768,
  LG: 1024,
  XL: 1200
};