import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tracing options are not natively supported by this browser client.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLoading(false);
      },
      (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access request declined by user privileges. Use search instead.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true, 
        timeout: 5000,            
        maximumAge: 0            
      }
    );
  }, []);

  return { location, error, loading };
};