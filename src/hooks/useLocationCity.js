import { useState, useCallback, useRef } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'WenApp/1.0 (event discovery; https://onwen.com)';

/**
 * Reverse geocode lat/lng to city name using Nominatim (OpenStreetMap).
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    addressdetails: '1',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const addr = data?.address;
  if (!addr) return null;
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
  const state = addr.state;
  if (state && typeof state === 'string' && state.length <= 3) {
    return city ? `${city}, ${state}` : state;
  }
  const stateAbbr = addr.state_code || state;
  return city ? (stateAbbr ? `${city}, ${stateAbbr}` : city) : stateAbbr || null;
}

/**
 * Get user's city from browser geolocation + reverse geocode.
 * Returns { city: string | null, loading: boolean, error: string | null, fetchCity: () => Promise<void> }
 */
export function useLocationCity(options = {}) {
  const { onSuccess, onError } = options;
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const attemptedRef = useRef(false);

  const MAX_WAIT_MS = 12000; // Force-stop loading after 12s so UI never hangs

  const fetchCity = useCallback(async () => {
    setLoading(true);
    setError(null);
    const forceStopTimer = setTimeout(() => {
      setLoading(false);
      attemptedRef.current = true;
    }, MAX_WAIT_MS);
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000 * 60 * 15,
        });
      });
      const { latitude, longitude } = position.coords;
      const resolved = await reverseGeocode(latitude, longitude);
      if (resolved) {
        setCity(resolved);
        onSuccess?.(resolved);
      } else {
        setError('Could not determine city');
        onError?.();
      }
    } catch (e) {
      const message = e?.message || 'Location unavailable';
      setError(message);
      setCity(null);
      onError?.(e);
    } finally {
      clearTimeout(forceStopTimer);
      setLoading(false);
      attemptedRef.current = true;
    }
  }, [onSuccess, onError]);

  const tryOnce = useCallback(() => {
    if (attemptedRef.current || loading || city) return;
    fetchCity();
  }, [fetchCity, loading, city]);

  const reset = useCallback(() => {
    attemptedRef.current = false;
    setCity(null);
    setError(null);
  }, []);

  return { city, loading, error, fetchCity, tryOnce, reset };
}
