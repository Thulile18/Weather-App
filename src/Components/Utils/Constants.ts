// The API key comes from an environment variable rather than being
// hardcoded here, so the real key never sits in the public GitHub
// source code. Locally it's read from a ".env" file (not committed);
// on Vercel it's set under Project Settings -> Environment Variables.
export const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY as string,
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
  SAVED_LOCATIONS: 'weather_saved_locations', 
  USER_SETTINGS: 'weather_user_settings'
}

export const CACHE_DURATION = 600000; 

export const BREAKPOINTS = {
  XS: 320,
  SM: 480,
  MD: 768,
  LG: 1024,
  XL: 1200
};