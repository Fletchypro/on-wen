import { useState, useCallback, useEffect } from 'react';
import { fetchExternalEventsByCity } from '@/lib/externalEventsApi';

/**
 * Fetches external (API) events for a city and returns them in app event shape.
 * Used by Discover → Nearby to show events from SeatGeek (or other sources).
 */
export function useExternalEvents(city) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!city || typeof city !== 'string') {
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExternalEventsByCity(city);
      const events = result?.events ?? (Array.isArray(result) ? result : []);
      setEvents(Array.isArray(events) ? events : []);
      setError(result?.error ?? null);
    } catch (e) {
      console.error('External events fetch failed:', e);
      setError(e?.message || 'Could not load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
