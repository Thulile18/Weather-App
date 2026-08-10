import React, { useState, useEffect } from 'react';

// Bypasses local compiler CSS side-effect checks cleanly
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
    // Automatically trigger native browser geolocation directly inside Home to prevent hook crashes
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
      console.error('LocalStorage persistence read layer execution failure:', storageError);
    }
  }, []);

  // --- DYNAMIC NOTIFICATION TIMEOUTS ---
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

  // --- DYNAMIC DATA STRUCTURING SETS ---
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
      <div className="status-container-centered" style={{ background: appTheme === 'dark' ? '#121824' : '#f5f7fa' }}>
        <div className="status-content">
          <div className="status-icon loading-animation" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a' }}>⏳</div>
          <p className="status-text" style={{ color: appTheme === 'dark' ? '#a0aec0' : '#8899aa' }}>Updating atmospheric metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`main-page-wrapper theme-${appTheme}`} 
      style={{ 
        background: appTheme === 'dark' ? '#121824' : '#f5f7fa',
        color: appTheme === 'dark' ? '#f7fafc' : '#1a2a3a',
        transition: 'background 0.3s, color 0.3s',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      {/* PROCESS NOTIFICATION BOX */}
      {processNotification && (
        <div 
          className="permission-alert-banner" 
          style={{ 
            background: appTheme === 'dark' ? '#2d3748' : '#e8f0fe', 
            color: appTheme === 'dark' ? '#63b3ed' : '#1a3a5c',
            fontWeight: 500,
            marginBottom: '16px',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
           {processNotification}
        </div>
      )}

      {/* SEARCH BAR INPUT GROUP */}
      <div className="search-section-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group" style={{ background: appTheme === 'dark' ? '#1a202c' : '#fff' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            onKeyDown={handleKeyPress}
            className="city-search-input"
            style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', background: 'transparent', border: 'none', width: '100%', outline: 'none' }}
          />
          <button type="submit" className="search-submit-button" style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {/* MAIN WEATHER CARD DISPLAY */}
      <div className="weather-card-container" style={{ background: appTheme === 'dark' ? '#1a202c' : '#fff', padding: '20px', borderRadius: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="location-title" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a' }}>{currentCity}</h2>
            <p className="condition-subtitle" style={{ color: '#8899aa' }}>Scattered Clouds</p>
          </div>
          <span className="weather-visual-emoji" style={{ fontSize: '48px' }}>⛅</span>
        </div>

        <div className="weather-card-body" style={{ margin: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="temperature-text" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', fontSize: '48px', fontWeight: 300 }}>
            {displayUnit === 'C' ? '22°C' : '72°F'}
          </div>

          <div className="secondary-stats" style={{ background: appTheme === 'dark' ? '#2d3748' : '#f5f6f8', padding: '12px', borderRadius: '16px' }}>
            <div className="stat-item-row" style={{ marginBottom: '8px', fontSize: '13px' }}>
              <span className="stat-label" style={{ color: '#8899aa' }}>Humidity:</span>
              <span className="stat-value" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', fontWeight: 500 }}>64%</span>
            </div>
            <div className="stat-item-row" style={{ fontSize: '13px' }}>
