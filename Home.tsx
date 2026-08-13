import React, { useState, useEffect } from 'react';
import { useWeather } from '../Hooks/UseWeather';
import { useLocation } from '../Hooks/UseLocation';
import WeatherDisplay from '../../Weather/WeatherDisplay';
import HourlyForecast from '../../Weather/HourlyForecast';
import DailyForecast from '../../Weather/DailyForecast';
import WeatherAlert from '../../Weather/WeatherAlert';
import './Home.css';

// A sensible starting city to use if the user says no to location access
// and hasn't searched for anything yet.
const DEFAULT_CITY = 'Cape Town';

// The Home page is the main dashboard. It shows the current weather for
// whichever location is active, lets the user search for a new location,
// switch between the hourly and daily forecast, and bookmark locations.
export const Home: React.FC = () => {
  const {
    currentWeather,
    forecast,
    alerts,
    loading,
    error,
    isOffline,
    settings,
    fetchWeather,
    fetchWeatherByCoords,
    updateSettings,
    saveLocation,
    removeLocation,
    getFavoriteLocations,
    dismissAlert
  } = useWeather();

  const { location: userCoords, error: locationError, loading: locationLoading } = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [forecastView, setForecastView] = useState<'hourly' | 'daily'>('hourly');
  const [hasLoadedInitialWeather, setHasLoadedInitialWeather] = useState(false);

  // On first load, try to use the browser's geolocation. If the user
  // denies permission (or their browser doesn't support it), fall back
  // to a default city so the page is never empty.
  useEffect(() => {
    if (hasLoadedInitialWeather || locationLoading) return;

    if (userCoords) {
      fetchWeatherByCoords(userCoords.lat, userCoords.lon);
      setHasLoadedInitialWeather(true);
    } else if (locationError) {
      fetchWeather(DEFAULT_CITY);
      setHasLoadedInitialWeather(true);
    }
  }, [userCoords, locationError, locationLoading, hasLoadedInitialWeather, fetchWeather, fetchWeatherByCoords]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cityName = searchTerm.trim();
    if (cityName !== '') {
      fetchWeather(cityName);
      setSearchTerm('');
    }
  };

  const handleUnitToggle = () => {
    if (!settings) return;
    updateSettings({
      ...settings,
      unit: settings.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    });
  };

  const favoriteLocations = getFavoriteLocations();
  const isCurrentLocationSaved = currentWeather
    ? favoriteLocations.includes(currentWeather.location)
    : false;

  const handleBookmarkToggle = () => {
    if (!currentWeather) return;
    if (isCurrentLocationSaved) {
      removeLocation(currentWeather.location);
    } else {
      saveLocation(currentWeather.location);
    }
  };

  return (
    <div className="main-page-wrapper">
      <section className="search-section-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <input
            type="text"
            className="city-search-input"
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="search-submit-button">
            Search
          </button>
        </form>
        {locationError && !currentWeather && (
          <p className="condition-subtitle">📍 {locationError}</p>
        )}
      </section>

      {loading && (
        <div className="status-container-centered">
          <div className="status-content">
            <div className="status-icon loading-animation">🌦️</div>
            <p className="status-text">Fetching the latest weather...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="status-container-centered">
          <div className="status-content">
            <div className="status-icon">{isOffline ? '📡' : '⚠️'}</div>
            <p className="error-message-text">{error}</p>
          </div>
        </div>
      )}

      {alerts.map((alert) => (
        <WeatherAlert key={alert.type} alert={alert} onDismiss={() => dismissAlert(alert.type)} />
      ))}

      {currentWeather && !loading && (
        <>
          <WeatherDisplay
            weather={currentWeather}
            unit={settings?.unit || 'celsius'}
            onToggleUnit={handleUnitToggle}
            isFavorite={isCurrentLocationSaved}
            onToggleFavorite={handleBookmarkToggle}
          />

          <div className="view-toggle-button-row">
            <button
              type="button"
              className={forecastView === 'hourly' ? 'primary' : ''}
              onClick={() => setForecastView('hourly')}
            >
              Hourly
            </button>
            <button
              type="button"
              className={forecastView === 'daily' ? 'primary' : ''}
              onClick={() => setForecastView('daily')}
            >
              Daily
            </button>
          </div>

          {forecast && forecastView === 'hourly' && (
            <HourlyForecast forecasts={forecast.hourly} unit={settings?.unit || 'celsius'} />
          )}
          {forecast && forecastView === 'daily' && (
            <DailyForecast forecasts={forecast.daily} unit={settings?.unit || 'celsius'} />
          )}
        </>
      )}

      {favoriteLocations.length > 0 && (
        <section className="saved-locations-section">
          <h3 className="forecast-section-title">Saved Locations</h3>
          <div className="saved-locations-chip-row">
            {favoriteLocations.map((city) => (
              <button
                key={city}
                type="button"
                className="location-chip-button"
                onClick={() => fetchWeather(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
