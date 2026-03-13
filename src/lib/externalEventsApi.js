/**
 * Fetches public events from an external API by city.
 * Uses only the Supabase Edge Function so SeatGeek credentials never touch the frontend.
 */

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Get public events for a city. Calls the Edge Function only (no client-side API keys).
 */
export async function fetchExternalEventsByCity(city) {
  if (!city || typeof city !== 'string') return [];
  const cityPart = city.split(',')[0].trim();
  if (!cityPart) return [];

  try {
    const { data, error } = await supabase.functions.invoke('fetch-external-events', {
      body: { city: cityPart },
    });
    if (error) throw error;
    const events = Array.isArray(data?.events) ? data.events : [];
    // Partial success: we may have events plus an error from one provider (e.g. SeatGeek fail, Ticketmaster ok)
    const err = data?.error && events.length === 0 ? data.error : (data?.error || null);
    if (err && events.length === 0) throw new Error(err);
    return { events, error: data?.error || null };
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[fetch-external-events]', e?.message || e);
    return { events: [], error: e?.message || 'Request failed' };
  }
}
