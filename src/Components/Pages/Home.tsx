import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const Home: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'hourly' | 'daily'>('hourly');
  const [currentCity, setCurrentCity] = useState<string>('Johannesburg');
  const [displayUnit, setDisplayUnit] = useState<'C' | 'F'>('C');
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light');
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  
  const [processNotification, setProcessNotification] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  // --- COMPONENT LIFECYCLE & CACHING ---
  useEffect(() => {
    // FIXED: Uses native browser geolocation directly inside Home to prevent hook crashes
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If user clicks Allow, show their local city using your mock setup safely
          setCurrentCity('Johannesburg (Local)');
          triggerNotificationMessage('Location access granted. Displaying local area weather.');
        },
        (error) => {
          // If user clicks Deny, fallback gracefully without a blank screen crash
          console.log('Location denied, using default city.');
          setCurrentCity('Johannesburg');
        },
        { timeout: 5000 }
      );
    }

    // Load data tokens from localStorage
    try {
      const storedFavorites = localStorage.getItem('weather_favorites');
      if (storedFavorites) {
        setFavoritesList(JSON.parse(storedFavorites));
      }
      const storedTheme = localStorage.getItem('weather_theme');
      if (storedTheme) {
        setAppTheme(storedTheme as 'light' | 'dark');
      }
      const storedUnit = localStorage.getItem('weather_unit');
      if (storedUnit) {
        setDisplayUnit(storedUnit as 'C' | 'F');
      }
    } catch (storageReadError) {
      console.error('Failed executing offline cached storage loops:', storageReadError);
    }
  }, []);

  const triggerNotificationMessage = (messageText: string) => {
    setProcessNotification(messageText);
    setTimeout(() => {
      setProcessNotification(null);
    }, 3000);
  };

  // --- ACTIONS HANDLERS ---
  const executeCitySearchRoutine = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim() === '') return;

    setLoadingState(true);
    const validatedCityName = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1).toLowerCase();

    setTimeout(() => {
      setCurrentCity(validatedCityName);
      setSearchQuery('');
      setLoadingState(false);
      triggerNotificationMessage(`Successfully updated metrics for ${validatedCityName}.`);
    }, 300);
  };

  const handleInputFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCitySearchRoutine();
    }
  };

  const toggleDisplayMeasurementUnits = () => {
    const nextUnitIndicator = displayUnit === 'C' ? 'F' : 'C';
    setDisplayUnit(nextUnitIndicator);
    localStorage.setItem('weather_unit', nextUnitIndicator);
    triggerNotificationMessage(`Display metrics toggled to °${nextUnitIndicator}.`);
  };

  const toggleApplicationThemeMode = () => {
    const nextThemeMode = appTheme === 'light' ? 'dark' : 'light';
    setAppTheme(nextThemeMode);
    localStorage.setItem('weather_theme', nextThemeMode);
    triggerNotificationMessage(`Visual interface swapped to ${nextThemeMode} mode.`);
  };

  const manageLocationBookmarksState = () => {
    let refreshedFavoritesRegister: string[];

    if (favoritesList.includes(currentCity)) {
      refreshedFavoritesRegister = favoritesList.filter((item) => item !== currentCity);
      triggerNotificationMessage(`${currentCity} removed from bookmarks.`);
    } else {
      refreshedFavoritesRegister = [...favoritesList, currentCity];
      triggerNotificationMessage(`${currentCity} saved to bookmarks list.`);
    }

    setFavoritesList(refreshedFavoritesRegister);
    localStorage.setItem('weather_favorites', JSON.stringify(refreshedFavoritesRegister));
  };

  const loadBookmarkedLocationProfile = (targetCityName: string) => {
    setLoadingState(true);
    setTimeout(() => {
      setCurrentCity(targetCityName);
      setLoadingState(false);
      triggerNotificationMessage(`Navigated to profile: ${targetCityName}.`);
    }, 200);
  };

  // --- WEATHER FORECAST COLLECTION DATA ---
  const hourlyForecastCollection: HourlyForecastNode[] = [
    { time: '09:00 AM', tempC: 20, tempF: 68, condition: 'Clear Sky', emoji: '☀️' },
    { time: '12:00 PM', tempC: 25, tempF: 77, condition: 'Scattered clouds', emoji: '⛅' },
    { time: '03:00 PM', tempC: 23, tempF: 73, condition: 'Overcast columns', emoji: '☁️' },
    { time: '06:00 PM', tempC: 19, tempF: 66, condition: 'Few clouds', emoji: '⛅' },
    { time: '09:00 PM', tempC: 16, tempF: 61, condition: 'Clear Sky', emoji: '🌙' },
  ];

  const dailyForecastCollection: DailyForecastNode[] = [
    { day: 'Mon', highC: 25, lowC: 14, highF: 77, lowF: 57, condition: 'Clear Sky', emoji: '☀️' },
    { day: 'Tue', highC: 26, lowC: 15, highF: 79, lowF: 59, condition: 'Few Clouds', emoji: '⛅' },
    { day: 'Wed', highC: 23, lowC: 13, highF: 73, lowF: 55, condition: 'Scattered', emoji: '☁️' },
    { day: 'Thu', highC: 21, lowC: 12, highF: 70, lowF: 54, condition: 'Light Rain', emoji: '🌧️' },
    { day: 'Fri', highC: 24, lowC: 14, highF: 75, lowF: 57, condition: 'Sunny Highs', emoji: '☀️' },
  ];

  const activeTempString = displayUnit === 'C' ? '22°C' : '72°F';

  if (loadingState) {
    return (
      <div className="status-container-centered" style={{ background: appTheme === 'dark' ? '#121824' : '#f5f7fa' }}>
        <div className="status-content">
          <div className="status-icon loading-animation" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a' }}>⏳</div>
          <p className="status-text" style={{ color: appTheme === 'dark' ? '#a0aec0' : '#8899aa' }}>Syncing atmospheric nodes...</p>
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
      
      {/* PROCESS NOTIFICATION BANNER */}
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

      {/* SEARCH FIELD BAR GROUP */}
      <div className="search-section-box">
        <form onSubmit={executeCitySearchRoutine} className="search-input-group" style={{ background: appTheme === 'dark' ? '#1a202c' : '#fff' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city location..."
            onKeyDown={handleInputFieldKeyDown}
            className="city-search-input"
            style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', background: 'transparent', border: 'none', width: '100%', outline: 'none' }}
          />
          <button type="submit" className="search-submit-button" style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {/* WEATHER DISPLAY CONTAINER */}
      <div className="weather-card-container" style={{ background: appTheme === 'dark' ? '#1a202c' : '#fff', padding: '20px', borderRadius: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="location-title" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a' }}>{currentCity}</h2>
            <p className="condition-subtitle" style={{ color: '#8899aa' }}>Scattered Atmospheric Clouds</p>
          </div>
          <span className="weather-visual-emoji" style={{ fontSize: '48px' }}>⛅</span>
        </div>

        <div className="weather-card-body" style={{ margin: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="temperature-text" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', fontSize: '48px', fontWeight: 300 }}>
            {activeTempString}
          </div>

          <div className="secondary-stats" style={{ background: appTheme === 'dark' ? '#2d3748' : '#f5f6f8', padding: '12px', borderRadius: '16px' }}>
            <div className="stat-item-row" style={{ marginBottom: '6px', fontSize: '13px' }}>
              <span className="stat-label" style={{ color: '#8899aa' }}>Humidity: </span>
              <span className="stat-value" style={{ color: appTheme === 'dark' ? '#fff' : '#1a2a3a', fontWeight: 500 }}>64%</span>
            </div>
