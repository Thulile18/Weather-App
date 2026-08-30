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
        } else if (err.code === err.TIMEOUT) {
          setError('Getting an exact GPS position is taking longer than usual (this can happen in areas with weaker signal, like rural or farm locations). Please try again, or search for your location instead.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        // 20 seconds instead of 5: a real GPS fix (rather than a rough
        // network-based guess) can take longer in areas with weaker
        // cell signal, which is common in rural or farm locations.
        timeout: 20000,
        // Accept a position from up to a minute ago instead of
        // demanding a brand new one every time. This makes the app
        // respond faster without meaningfully hurting accuracy.
        maximumAge: 60000
      }
    );
  }, []);

  return { location, error, loading };
};