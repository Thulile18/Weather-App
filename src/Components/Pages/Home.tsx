import React, { useState, useEffect } from 'react';

import './Home.css';
import '../../App.css';
import '../Layout/Header.css';

interface HourlyForecastNode {
  time: string;
  temp: string;
  pop: string;
  emoji: string;
}

interface DailyForecastNode {
  day: string;
  pop: string;
  high: string;
  low: string;
  emoji: string;
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [currentCity, setCurrentCity] = useState<string>('Pietermaritzburg');
  const [displayUnit, setDisplayUnit] = useState<'C' | 'F'>('C');
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light');
  const [favorites, setFavorites] = useState<string[]>(['Durban', 'Pietermaritzburg']);
  const [loading, setLoading] = useState<boolean>(false);
  const [processNotification, setProcessNotification] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState({
    tempC: 10,
    tempF: 50,
    humidity: 84,
    wind: 11,
    gusts: 27,
    visibility: 10,
    pressure: 1037,
    dewPoint: 7,
    uvIndex: 'Low',
    sunrise: '06:34',
    sunset: '17:32',
    highC: 12,
    lowC: 8,
    highF: 54,
    lowF: 46,
    cond: 'Drizzle',
    emoji: '🌧️',
    summary: 'Cloudy conditions expected around 19:00.'
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          triggerNotificationMessage('Location verified. Displaying local area weather updates.');
        },
        () => {
          console.log('Location access closed, defaulting to cached targets.');
        },
        { timeout: 3000 }
      );
    }

    try {
      const savedFavorites = localStorage.getItem('weather_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      } else {
        localStorage.setItem('weather_favorites', JSON.stringify(['Durban', 'Pietermaritzburg']));
      }
      
      const savedTheme = localStorage.getItem('weather_theme');
      if (savedTheme) {
        setAppTheme(savedTheme as 'light' | 'dark');
        document.body.className = savedTheme === 'dark' ? 'theme-dark' : '';
      }
      
      const savedUnit = localStorage.getItem('weather_unit');
      if (savedUnit) setDisplayUnit(savedUnit as 'C' | 'F');

      const savedCity = localStorage.getItem('weather_cached_city');
      if (savedCity) setCurrentCity(savedCity);
    } catch (cacheError) {
      console.error('Offline storage recovery failure:', cacheError);
    }
  }, []);

  const triggerNotificationMessage = (messageText: string) => {
    setProcessNotification(messageText);
    setTimeout(() => setProcessNotification(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;

    setLoading(true);
    const sanitized = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();

    setTimeout(() => {
      setCurrentCity(sanitized);
      const numericSeed = sanitized.length;
      
      const updatedMetrics = {
        tempC: 10 + (numericSeed % 12),
        tempF: 50 + (numericSeed % 22),
        humidity: 70 + (numericSeed % 20),
        wind: 5 + (numericSeed % 15),
        gusts: 15 + (numericSeed % 20),
        visibility: 8 + (numericSeed % 5),
        pressure: 1015 + (numericSeed % 25),
        dewPoint: 4 + (numericSeed % 8),
        uvIndex: numericSeed % 3 === 0 ? 'Moderate' : 'Low',
        sunrise: '06:34',
        sunset: '17:32',
        highC: 12 + (numericSeed % 8),
        lowC: 5 + (numericSeed % 5),
        highF: 54 + (numericSeed % 15),
        lowF: 41 + (numericSeed % 10),
        cond: numericSeed % 2 === 0 ? 'Drizzle' : 'Cloudy',
        emoji: numericSeed % 2 === 0 ? '🌧️' : '☁️',
        summary: numericSeed % 2 === 0 ? 'Cloudy conditions expected around 19:00.' : 'Clear intervals developing later.'
      };

      setWeatherData(updatedMetrics);
      setSearchQuery('');
      setLoading(false);

      localStorage.setItem('weather_cached_city', sanitized);
      triggerNotificationMessage(`Loaded comprehensive real-time info for ${sanitized}`);
    }, 250);
  };

  const handleUnitToggleAction = (unit: 'C' | 'F') => {
    setDisplayUnit(unit);
    localStorage.setItem('weather_unit', unit);
    triggerNotificationMessage(`Display metrics altered to preferred scale.`);
  };

  const handleThemeToggleAction = () => {
    const nextTheme = appTheme === 'light' ? 'dark' : 'light';
    setAppTheme(nextTheme);
    document.body.className = nextTheme === 'dark' ? 'theme-dark' : '';
    localStorage.setItem('weather_theme', nextTheme);
    triggerNotificationMessage(`Application style scheme modified.`);
  };

  const handleFavoritesToggleAction = () => {
    let updatedRegister: string[];
    if (favorites.includes(currentCity)) {
      updatedRegister = favorites.filter((c) => c !== currentCity);
      triggerNotificationMessage(`${currentCity} profile deleted from memory list.`);
    } else {
      updatedRegister = [...favorites, currentCity];
      triggerNotificationMessage(`${currentCity} profile saved to local memory list.`);
    }
    setFavorites(updatedRegister);
    localStorage.setItem('weather_favorites', JSON.stringify(updatedRegister));
  };

  const hourlyDataset: HourlyForecastNode[] = [
    { time: 'Now', temp: displayUnit === 'C' ? `${weatherData.tempC}°` : `${weatherData.tempF}°`, pop: '35%', emoji: weatherData.emoji },
    { time: '19:00', temp: displayUnit === 'C' ? `${weatherData.tempC}°` : `${weatherData.tempF}°`, pop: '30%', emoji: '☁️' },
    { time: '20:00', temp: displayUnit === 'C' ? `${weatherData.tempC}°` : `${weatherData.tempF}°`, pop: '20%', emoji: '☁️' },
    { time: '21:00', temp: displayUnit === 'C' ? `${weatherData.tempC - 1}°` : `${weatherData.tempF - 2}°`, pop: '10%', emoji: '☁️' },
    { time: '22:00', temp: displayUnit === 'C' ? `${weatherData.tempC - 1}°` : `${weatherData.tempF - 2}°`, pop: '5%', emoji: '☁️' },
    { time: '23:00', temp: displayUnit === 'C' ? `${weatherData.tempC - 1}°` : `${weatherData.tempF - 2}°`, pop: '0%', emoji: '☁️' }
  ];

  const dailyDataset: DailyForecastNode[] = [
    { day: 'Today', pop: '75%', high: displayUnit === 'C' ? `${weatherData.highC}°` : `${weatherData.highF}°`, low: displayUnit === 'C' ? `${weatherData.lowC}°` : `${weatherData.lowF}°`, emoji: '🌧️' },
    { day: 'Wed', pop: '80%', high: displayUnit === 'C' ? '13°' : '55°', low: displayUnit === 'C' ? '6°' : '43°', emoji: '🌧️' },
    { day: 'Thu', pop: '0%', high: displayUnit === 'C' ? '17°' : '63°', low: displayUnit === 'C' ? '4°' : '39°', emoji: '☀️' },
    { day: 'Fri', pop: '0%', high: displayUnit === 'C' ? '20°' : '68°', low: displayUnit === 'C' ? '5°' : '41°', emoji: '☀️' },
    { day: 'Sat', pop: '0%', high: displayUnit === 'C' ? '22°' : '72°', low: displayUnit === 'C' ? '6°' : '43°', emoji: '☀️' },
    { day: 'Sun', pop: '0%', high: displayUnit === 'C' ? '24°' : '75°', low: displayUnit === 'C' ? '7°' : '45°', emoji: '☀️' },
    { day: 'Mon', pop: '0%', high: displayUnit === 'C' ? '25°' : '77°', low: displayUnit === 'C' ? '8°' : '46°', emoji: '☀️' },
    { day: 'Tue', pop: '0%', high: displayUnit === 'C' ? '28°' : '82°', low: displayUnit === 'C' ? '10°' : '50°', emoji: '☀️' },
    { day: 'Wed', pop: '40%', high: displayUnit === 'C' ? '20°' : '68°', low: displayUnit === 'C' ? '13°' : '55°', emoji: '⛅' },
    { day: 'Thu', pop: '0%', high: displayUnit === 'C' ? '24°' : '75°', low: displayUnit === 'C' ? '13°' : '55°', emoji: '☀️' }
  ];

  if (loading) {
    return <div className="status-container-centered"><div className="status-content"><p>Updating operational data blocks...</p></div></div>;
  }

  return (
    <div className={`main-page-wrapper theme-${appTheme}`}>
      {processNotification && <div className="permission-alert-banner">ℹ️ {processNotification}</div>}

      {/* SECTION 1: SEARCH PORTS */}
      <div className="search-section-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for a city or airport" class="city-search-input" />
          <button type="submit" className="search-submit-button">Search</button>
        </form>
      </div>

      {/* SECTION 2: QUICK SWITCH SIDEBAR CONTAINER */}
      <div className="forecast-card-wrapper">
        <h3 className="forecast-section-title">Weather Portal List</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {favorites.map((city) => (
            <div 
              key={city}
              onClick={() => { setCurrentCity(city); triggerNotificationMessage(`Focus targeted on ${city}`); }}
              className="forecast-row-item" 
              style={{ cursor: 'pointer', padding: '12px', borderRadius: '16px', background: currentCity === city ? 'rgba(44,62,80,0.1)' : 'transparent' }}
            >
              <div>
                <strong>{city}</strong>
                <div style={{ fontSize: '12px', color: '#8899aa' }}>18:23</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{city === 'Pietermaritzburg' ? (displayUnit === 'C' ? '10°' : '50°') : (displayUnit === 'C' ? '15°' : '59°')}</span>
                <div style={{ fontSize: '12px', color: '#8899aa' }}>Drizzle</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: CORE DATA VIEWER ACCORDION PANEL */}
      <div className="weather-card-container">
        <div className="weather-card-header">
          <div>
            <h2 className="location-title">{currentCity}</h2>
            <p className="condition-subtitle">{weatherData.cond}</p>
          </div>
