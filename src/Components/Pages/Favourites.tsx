import React, { useState, useEffect } from 'react';
import { useWeather } from '../Hooks/UseWeather';
import Button from '../Button';
import Card from '../Card';
import { Link } from 'react-router-dom';

const Favourites: React.FC = () => {
  const { 
    getFavoriteLocations, 
    removeLocation, 
    fetchWeather,
    currentWeather,
    loading 
  } = useWeather();
  
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteLocations());
  }, []);

  const handleRemove = (location: string) => {
    removeLocation(location);
    setFavorites(getFavoriteLocations()); 
  };

  const handleView = (location: string) => {
    fetchWeather(location);
  };

  return (
    <div className="portfolio-page-wrapper">
      <h2 className="portfolio-section-heading"> Your Saved Locations Portfolio </h2>

      {favorites.length === 0 ? (
        <p className="settings-info-text">
          You haven't saved any locations yet. Search for a city on the Home
          page and tap "Save" to add it here.
        </p>
      ) : (
        <div className="portfolio-responsive-grid">
          {favorites.map((location) => (
            <Card key={location} hoverable className="portfolio-item-card">

              <span className="portfolio-location-name">{location}</span>
              {currentWeather?.location === location && (
                <span className="active-marker-badge"> Active View </span>
              )}

              <div className="card-bottom-actions-row">
                <Button
                  onClick={() => handleView(location)}
                  variant="primary"
                  size="sm"
                  className="action-btn-grow"
                  disabled={loading}
                >
                  {loading && currentWeather?.location === location ? 'Loading...' : 'View Weather'}
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
          ))}
        </div>
      )}

      <div className="portfolio-footer-navigation-block">
        <Link to="/">
          <Button variant="secondary"> Return to Dashboard </Button>
        </Link>
      </div>
    </div>
  );
};

export default Favourites;