import React, { useState, useEffect } from 'react';
import { useWeather } from '../Hooks/UseWeather';
import Button from '../Button';
import Card from '../Card';
import { Link } from 'react-router-dom';
import { formatTemperature } from '../Utils/Helpers';

// The Favourites page lists every location the user has saved, and lets
// them jump between locations, view a quick weather summary, or remove
// a saved location.
const Favourites: React.FC = () => {
  const {
    getFavoriteLocations,
    removeLocation,
    fetchWeather,
    currentWeather,
    settings,
    loading
  } = useWeather();

  const [favorites, setFavorites] = useState<string[]>([]);

  // Favourites live inside the shared settings object, so we re-read
  // them whenever the settings change (e.g. after a location is added
  // or removed elsewhere in the app).
  useEffect(() => {
    setFavorites(getFavoriteLocations());
  }, [settings, getFavoriteLocations]);

  const handleRemove = (location: string) => {
    removeLocation(location);
    setFavorites(getFavoriteLocations());
  };

  const handleView = (location: string) => {
    fetchWeather(location);
  };

  const unit = settings?.unit || 'celsius';

  return (
    <div className="portfolio-page-wrapper">
      <h2 className="portfolio-section-heading">Your Saved Locations</h2>

      {favorites.length === 0 ? (
        <div className="empty-favorites-message">
          <p>You haven't saved any locations yet.</p>
          <p>Search for a city on the Home page and tap "Save" to add it here.</p>
        </div>
      ) : (
        <div className="portfolio-responsive-grid">
          {favorites.map((location) => {
            const isActive = currentWeather?.location === location;

            return (
              <Card key={location} hoverable className="portfolio-item-card">
                <span className="portfolio-location-name">{location}</span>
                {isActive && <span className="active-marker-badge">Active View</span>}

                {isActive && currentWeather && (
                  <div className="portfolio-weather-summary">
                    <span>{formatTemperature(currentWeather.temperature, unit)}</span>
                    <span>Humidity: {currentWeather.humidity}%</span>
                    <span>Wind: {currentWeather.windSpeed} m/s</span>
                  </div>
                )}

                <div className="card-bottom-actions-row">
                  <Button
                    onClick={() => handleView(location)}
                    variant="primary"
                    size="sm"
                    className="action-btn-grow"
                    disabled={loading}
                  >
                    {loading && isActive ? 'Loading...' : 'View Weather'}
                  </Button>
                  <Button
                    onClick={() => handleRemove(location)}
                    variant="danger"
                    size="sm"
                    className="action-btn-grow"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="portfolio-footer-navigation-block">
        <Link to="/">
          <Button variant="secondary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Favourites;
