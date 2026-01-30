
import { useState, useEffect } from 'react';
import type { GeolocationState } from '../types';

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: { latitude: null, longitude: null, locationName: null },
  });

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: {
            code: 0,
            message: "Geolocation is not supported by your browser",
        },
        data: { latitude: null, longitude: null, locationName: null },
      });
      return;
    }
    
    setState(prevState => ({...prevState, loading: true}));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }
          const data = await response.json();
          const locationName = data.display_name || 'Unknown Location';

          setState({
            loading: false,
            error: null,
            data: {
              latitude,
              longitude,
              locationName,
            },
          });
        } catch (e) {
            const { latitude, longitude } = position.coords;
            setState({
                loading: false,
                error: { message: 'Failed to get location name.' },
                data: { 
                    latitude, 
                    longitude,
                    locationName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
                },
            });
        }
      },
      (error) => {
        setState({
          loading: false,
          error,
          data: { latitude: null, longitude: null, locationName: null },
        });
      }
    );
  };
  
  // Initially we won't fetch location, we'll let user click a button.
  useEffect(() => {
    setState(prevState => ({ ...prevState, loading: false }));
  }, []);

  return { ...state, getGeolocation };
};
