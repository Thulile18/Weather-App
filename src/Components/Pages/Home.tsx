import React, { useState, useEffect } from 'react';

// Bypasses the strict local CSS declarations during compilation
// @ts-ignore
import './Home.css';
// @ts-ignore
import '../../App.css';
// @ts-ignore
import '../Layout/Header.css';

// --- DATA STRUCTURE TYPES ---
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
  // --- CORE APPLICATION STATES ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [currentCity, setCurrentCity] = useState<string>('Johannesburg');
  const [displayUnit, setDisplayUnit] = useState<'C' | 'F'>('C');
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processNotification, setProcessNotification] = useState<string | null>(null);

  // --- COMPONENT LIFECYCLE INITIALIZATION ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setCurrentCity('Johannesburg (Local)');
          triggerNotificationMessage('Location access granted. Displaying local area weather.');
        },
        () => {
          console.log('Location denied, using default city.');
          setCurrentCity('Johannesburg');
        },
        { timeout: 5000 }
      );
    }

    try {
      const savedFavorites = localStorage.getItem('weather_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      const savedTheme = localStorage.getItem('weather_theme');
      if (savedTheme) {
        setAppTheme(savedTheme as 'light' | 'dark');
      }
      const savedUnit = localStorage.getItem('weather_unit');
      if (savedUnit) {
        setDisplayUnit(savedUnit as 'C' | 'F');
      }
    } catch (storageError) {
      console.error('LocalStorage persistence read execution failure:', storageError);
    }
  }, []);

  const triggerNotificationMessage = (messageText: string) => {
    setProcessNotification(messageText);
    setTimeout(() => {
      setProcessNotification(null);
    }, 3000);
  };

  // --- OPERATIONAL CONTROL HANDLERS ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;

    setLoading(true);
    setTimeout(() => {
      const sanitizedCityName = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();
      setCurrentCity(sanitizedCityName);
      setSearchQuery('');
      setLoading(false);
      triggerNotificationMessage(`Successfully updated metrics for ${sanitizedCityName}.`);
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim() !== '') {
        setLoading(true);
        setTimeout(() => {
          const sanitizedCityName = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();
          setCurrentCity(sanitizedCityName);
          setSearchQuery('');
          setLoading(false);
          triggerNotificationMessage(`Successfully updated metrics for ${sanitizedCityName}.`);
        }, 400);
      }
    }
  };

  const handleUnitToggleAction = () => {
    const nextUnit = displayUnit === 'C' ? 'F' : 'C';
    setDisplayUnit(nextUnit);
    localStorage.setItem('weather_unit', nextUnit);
    triggerNotificationMessage(`Display metrics toggled to °${nextUnit}.`);
  };

  const handleThemeToggleAction = () => {
    const nextTheme = appTheme === 'light' ? 'dark' : 'light';
    setAppTheme(nextTheme);
    localStorage.setItem('weather_theme', nextTheme);
    triggerNotificationMessage(`Visual interface swapped to ${nextTheme} mode.`);
  };

  const handleFavoritesToggleAction = () => {
    let updatedFavoritesList: string[];
    if (favorites.includes(currentCity)) {
      updatedFavoritesList = favorites.filter((city) => city !== currentCity);
      triggerNotificationMessage(`${currentCity} removed from bookmarks.`);
    } else {
      updatedFavoritesList = [...favorites, currentCity];
      triggerNotificationMessage(`${currentCity} saved to storage bookmarks list.`);
    }
    setFavorites(updatedFavoritesList);
    localStorage.setItem('weather_favorites', JSON.stringify(updatedFavoritesList));
  };

  const handleFavoriteClickRoute = (selectedCity: string) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentCity(selectedCity);
      setLoading(false);
      triggerNotificationMessage(`Navigated to bookmarked profile: ${selectedCity}.`);
    }, 300);
  };

  // --- DATA COLLECTION OBJECTS ---
  const hourlyDataset: HourlyForecastNode[] = [
    { time: '09:00 AM', tempC: 19, tempF: 66, condition: 'Clear', emoji: '☀️' },
    { time: '12:00 PM', tempC: 24, tempF: 75, condition: 'Scattered Clouds', emoji: '⛅' },
    { time: '03:00 PM', tempC: 22, tempF: 72, condition: 'Overcast', emoji: '☁️' },
    { time: '06:00 PM', tempC: 18, tempF: 64, condition: 'Few Clouds', emoji: '⛅' },
    { time: '09:00 PM', tempC: 15, tempF: 59, condition: 'Clear', emoji: '🌙' },
  ];

  const dailyDataset: DailyForecastNode[] = [
    { day: 'Mon', highC: 24, lowC: 14, highF: 75, lowF: 57, condition: 'Clear Sky', emoji: '☀️' },
    { day: 'Tue', highC: 26, lowC: 15, highF: 79, lowF: 59, condition: 'Few Clouds', emoji: '⛅' },
    { day: 'Wed', highC: 23, lowC: 13, highF: 73, lowF: 55, condition: 'Scattered', emoji: '☁️' },
    { day: 'Thu', highC: 21, lowC: 12, highF: 70, lowF: 54, condition: 'Light Rain', emoji: '🌧️' },
    { day: 'Fri', highC: 22, lowC: 14, highF: 72, lowF: 57, condition: 'Clear Sky', emoji: '☀️' },
  ];

  if (loading) {
    return (
      <div className="status-container-centered">
        <div className="status-content">
          <div className="status-icon loading-animation">⏳</div>
          <p className="status-text">Updating atmospheric metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page-wrapper">
      
      {/* PROCESS NOTIFICATION BOX */}
      {processNotification && (
        <div className="permission-alert-banner">
           {processNotification}
        </div>
      )}

      {/* SEARCH BAR INPUT GROUP */}
      <div className="search-section-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            onKeyDown={handleKeyPress}
            className="city-search-input"
          />
          <button type="submit" className="search-submit-button">
            Search
          </button>
        </form>
      </div>

      {/* MAIN WEATHER CARD DISPLAY */}
      <div className="weather-card-container">
        <div className="weather-card-header">
          <div>
            <h2 className="location-title">{currentCity}</h2>
            <p className="condition-subtitle">Scattered Clouds</p>
          </div>
          <span className="weather-visual-emoji">⛅</span>
        </div>

        <div className="weather-card-body">
          <div className="temperature-text">
            {displayUnit === 'C' ? '22°C' : '72°F'}
          </div>

          <div className="secondary-stats">
            <div className="stat-item-row">
              <span className="stat-label">Humidity:</span>
              <span className="stat-value">64%</span>
            </div>
            <div className="stat-item-row">
              <span className="stat-label">Wind Speed:</span>
              <span className="stat-value">4.2 m/s</span>
            </div>
          </div>
        </div>

        <div className="weather-card-footer">
          <button type="button" onClick={handleUnitToggleAction} className="search-submit-button">
            Unit: °{displayUnit}
          </button>
          <button type="button" onClick={handleThemeToggleAction} className="search-submit-button">
            Theme: {appTheme.toUpperCase()}
          </button>
          <button type="button" onClick={handleFavoritesToggleAction} className="search-submit-button">
            {favorites.includes(currentCity) ? '⭐ Saved' : '⭐ Save Location'}
          </button>
        </div>
      </div>

      {/* VIEW SELECTION TOGGLES */}
      <div className="view-toggle-button-row">
        <button
          type="button"
          className={viewType === 'hourly' ? 'primary' : ''}
          onClick={() => setViewType('hourly')}
        >
          Hourly
        </button>
        <button
          type="button"
          className={viewType === 'daily' ? 'primary' : ''}
          onClick={() => setViewType('daily')}
        >
          Daily
        </button>
      </div>

      {/* FORECAST VIEW WRAPPER */}
      <div className="forecast-results-container">
        {viewType === 'hourly' ? (
          <div className="forecast-card-wrapper">
            <h3 className="forecast-section-title">Hourly Forecast</h3>
            <div className="horizontal-scroll-viewport">
              <div className="scroll-flex-track">
                {hourlyDataset.map((node, idx) => (
                  <div key={idx} className="forecast-column-node">
                    <div className="node-time-header">{node.time}</div>
                    <div className="node-icon-visual-box">{node.emoji}</div>
                    <div className="node-temperature-readout">
                      {displayUnit === 'C' ? `${node.tempC}°C` : `${node.tempF}°F`}
                    </div>
                    <div className="node-condition-label">{node.condition}</div>
