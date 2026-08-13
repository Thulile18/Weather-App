// The API key is read from an environment variable (see .env.example)
// so it is never committed to source control as plain text.
export const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: import.meta.env.VITE_WEATHER_API_KEY as string,
  UNITS: 'metric'
};

export const CACHE_DURATION = 600000; 

export const BREAKPOINTS = {
  XS: 320,
  SM: 480,
  MD: 768,
  LG: 1024,
  XL: 1200
};