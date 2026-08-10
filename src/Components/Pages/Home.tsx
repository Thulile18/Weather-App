import React, { useState, useEffect } from 'react';

// @ts-ignore
import './Home.css';
// @ts-ignore
import '../../App.css';
// @ts-ignore
import '../Layout/Header.css';

interface HourlyForecastNode {
  time: string;
  tempC: number;
  tempF: number;
  condition: string;
  emoji: string;
}

interface DailyForecastNode {
  day: string;
  highC: number;
  lowC: number;
  highF: number;
  lowF: number;
  condition: string;
  emoji: string;
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [currentCity, setCurrentCity] = useState<string>('Johannesburg');
  const [displayUnit, setDisplayUnit] = useState<'C' | 'F'>('C');
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processNotification, setProcessNotification] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setCurrentCity('Johannesburg (Local)');
          triggerNotificationMessage('Location access granted.');
        },
        () => {
          setCurrentCity('Johannesburg');
        },
        { timeout: 5000 }
      );
    }

    try {
      const savedFavorites = localStorage.getItem('weather_favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      const savedTheme = localStorage.getItem('weather_theme');
      if (savedTheme) setAppTheme(savedTheme as 'light' | 'dark');
      const savedUnit = localStorage.getItem('weather_unit');
      if (savedUnit) setDisplayUnit(savedUnit as 'C' | 'F');
    } catch (e) {
      console.error(e);
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
    setTimeout(() => {
      const sanitized = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();
      setCurrentCity(sanitized);
      setSearchQuery('');
      setLoading(false);
      triggerNotificationMessage(`Loaded ${sanitized}`);
    }, 400);
  };

  const handleUnitToggleAction = () => {
    const nextUnit = displayUnit === 'C' ? 'F' : 'C';
    setDisplayUnit(nextUnit);
    localStorage.setItem('weather_unit', nextUnit);
  };

  const handleThemeToggleAction = () => {
    const nextTheme = appTheme === 'light' ? 'dark' : 'light';
    setAppTheme(nextTheme);
    localStorage.setItem('weather_theme', nextTheme);
  };

  const handleFavoritesToggleAction = () => {
    let updated: string[];
    if (favorites.includes(currentCity)) {
      updated = favorites.filter((c) => c !== currentCity);
    } else {
      updated = [...favorites, currentCity];
    }
    setFavorites(updated);
    localStorage.setItem('weather_favorites', JSON.stringify(updated));
  };

  const hourlyDataset: HourlyForecastNode[] = [
    { time: '09:00 AM', tempC: 19, tempF: 66, condition: 'Clear', emoji: '☀️' },
    { time: '12:00 PM', tempC: 24, tempF: 75, condition: 'Clouds', emoji: '⛅' },
    { time: '03:00 PM', tempC: 22, tempF: 72, condition: 'Overcast', emoji: '☁️' },
    { time: '06:00 PM', tempC: 18, tempF: 64, condition: 'Clouds', emoji: '⛅' }
  ];

  const dailyDataset: DailyForecastNode[] = [
    { day: 'Mon', highC: 24, lowC: 14, highF: 75, lowF: 57, condition: 'Clear', emoji: '☀️' },
    { day: 'Tue', highC: 26, lowC: 15, highF: 79, lowF: 59, condition: 'Clouds', emoji: '⛅' },
    { day: 'Wed', highC: 23, lowC: 13, highF: 73, lowF: 55, condition: 'Overcast', emoji: '☁️' }
  ];

  if (loading) {
    return <div className="status-container-centered"><div className="status-content"><p>Loading...</p></div></div>;
  }

  return (
    <div className="main-page-wrapper">
      {processNotification && <div className="permission-alert-banner">ℹ️ {processNotification}</div>}
      <div className="search-section-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search city..." className="city-search-input" />
          <button type="submit" className="search-submit-button">Search</button>
        </form>
      </div>
      <div className="weather-card-container">
        <div className="weather-card-header">
          <div>
            <h2 className="location-title">{currentCity}</h2>
            <p className="condition-subtitle">Scattered Clouds</p>
          </div>
          <span className="weather-visual-emoji">⛅</span>
        </div>
        <div className="weather-card-body">
          <div className="temperature-text">{displayUnit === 'C' ? '22°C' : '72°F'}</div>
          <div className="secondary-stats">
            <div className="stat-item-row"><span className="stat-label">Humidity:</span><span className="stat-value">64%</span></div>
            <div className="stat-item-row"><span className="stat-label">Wind Speed:</span><span className="stat-value">4.2 m/s</span></div>
          </div>
        </div>
        <div className="weather-card-footer">
          <button type="button" onClick={handleUnitToggleAction} className="search-submit-button">Unit: °{displayUnit}</button>
          <button type="button" onClick={handleThemeToggleAction} className="search-submit-button">Theme</button>
          <button type="button" onClick={handleFavoritesToggleAction} className="search-submit-button">{favorites.includes(currentCity) ? '⭐ Saved' : '⭐ Save'}</button>
        </div>
      </div>
      <div className="view-toggle-button-row">
        <button type="button" className={viewType === 'hourly' ? 'primary' : ''} onClick={() => setViewType('hourly')}>Hourly</button>
        <button type="button" className={viewType === 'daily' ? 'primary' : ''} onClick={() => setViewType('daily')}>Daily</button>
      </div>
      <div className="forecast-results-container">
        {viewType === 'hourly' ? (
          <div className="forecast-card-wrapper">
            <h3 className="forecast-section-title">Hourly Forecast</h3>
            <div className="horizontal-scroll-viewport">
              <div className="scroll-flex-track">
                {hourlyDataset.map((node, idx) => (
                  <div key={idx} className="forecast-column-node">
                    <div>{node.time}</div><div>{node.emoji}</div>
                    <div>{displayUnit === 'C' ? `${node.tempC}°C` : `${node.tempF}°F`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="daily-forecast-container">
            <h3 className="daily-forecast-title">5-Day Forecast</h3>
            <div className="daily-list-stack">
              {dailyDataset.map((row, idx) => (
                <div key={idx} className="forecast-row-item">
                  <span>{row.day} {row.emoji}</span>
                  <span>{displayUnit === 'C' ? `${row.highC}°C` : `${row.highF}°F`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {favorites.length > 0 && (
        <div className="forecast-card-wrapper">
          <h3 className="forecast-section-title">Saved Locations</h3>
          <div className="favorites-button-grid">
            {favorites.map((city) => (
              <button key={city} type="button" onClick={() => setCurrentCity(city)} className="forecast-column-node">⭐ {city}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
