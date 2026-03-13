// Supabase Edge Function: fetch external events by city (SeatGeek + Ticketmaster).
// Persists to external_events so everyone can see them via get_external_events_by_city.
// Secrets: SEATGEEK_CLIENT_ID (optional SEATGEEK_CLIENT_SECRET), TICKETMASTER_API_KEY (optional),
//          SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Deploy: supabase functions deploy fetch-external-events

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SEATGEEK_BASE = 'https://api.seatgeek.com/2/events';
const TICKETMASTER_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json';

/** Extract best image URL from SeatGeek event (performers or event-level). */
function pickSeatGeekImage(e: Record<string, unknown>): string | null {
  const performers = (e.performers || []) as Record<string, unknown>[];
  for (const p of performers) {
    const img = p?.image ?? (Array.isArray(p?.images) ? (p.images[0] as Record<string, unknown>)?.url ?? (p.images[0] as string) : null);
    if (typeof img === 'string' && img.startsWith('http')) return img;
    if (img && typeof img === 'object' && typeof (img as Record<string, unknown>).url === 'string') return (img as Record<string, unknown>).url as string;
  }
  const top = e.image ?? (Array.isArray(e.images) ? (e.images[0] as Record<string, unknown>)?.url ?? (e.images[0] as string) : null);
  if (typeof top === 'string' && top.startsWith('http')) return top;
  if (top && typeof top === 'object' && typeof (top as Record<string, unknown>).url === 'string') return (top as Record<string, unknown>).url as string;
  return null;
}

function normalizeSeatGeek(e: Record<string, unknown>) {
  const datetime = (e.datetime_local || e.datetime_utc) as string;
  let date = '';
  let time = '';
  if (datetime) {
    const d = new Date(datetime);
    date = d.toISOString().slice(0, 10);
    time = d.toTimeString().slice(0, 5);
  }
  const venue = (e.venue || {}) as Record<string, unknown>;
  const image = pickSeatGeekImage(e);
  const location = [venue.name, venue.address, venue.extended_address]
    .filter(Boolean)
    .join(', ') || (venue.city as string) || '';
  return {
    id: `ext-${e.id}`,
    external_id: `ext-${e.id}`,
    title: (e.title || e.short_title || 'Event') as string,
    date,
    time,
    location,
    address: venue.address
      ? [venue.address, venue.city, venue.state].filter(Boolean).join(', ')
      : '',
    image,
    isExternal: true,
    source: 'seatgeek',
    external_url: e.url,
    attendees: [],
    user_id: null,
    visibility: 2,
  };
}

/** Pick best image from Ticketmaster images array (prefer primary non-fallback, then 16_9, then largest). */
function pickTmImage(images: unknown): string | null {
  const arr = Array.isArray(images) ? images : [];
  const withUrl = arr.filter((i): i is Record<string, unknown> => typeof i === 'object' && i != null && typeof (i as Record<string, unknown>).url === 'string');
  if (withUrl.length === 0) return null;
  const primary = withUrl.find((i) => i.fallback === false);
  const candidate = primary ?? withUrl.find((i) => i.ratio === '16_9') ?? withUrl[0];
  const url = (candidate?.url as string)?.trim();
  return url && url.startsWith('http') ? url : null;
}

function normalizeTicketmaster(e: Record<string, unknown>) {
  const dates = (e.dates || {}) as Record<string, unknown>;
  const start = (dates.start || {}) as Record<string, unknown>;
  const localDate = (start.localDate as string) || '';
  const localTime = (start.localTime as string) || '';
  const date = localDate ? localDate.slice(0, 10) : '';
  const time = localTime ? localTime.slice(0, 5) : '';
  const embedded = (e._embedded || {}) as Record<string, unknown>;
  const venues = (embedded.venues || []) as Record<string, unknown>[];
  const venue = venues[0] || {};
  const location = [venue.name, venue.address?.line1, (venue.city as string), venue.state].filter(Boolean).join(', ') || (venue.city as string) || '';
  const address = venue.address
    ? [((venue.address as Record<string, unknown>).line1 as string), venue.city, venue.state].filter(Boolean).join(', ')
    : '';
  const image = pickTmImage(e.images);
  return {
    id: `tm-${e.id}`,
    external_id: `tm-${e.id}`,
    title: (e.name || e.title || 'Event') as string,
    date,
    time,
    location,
    address,
    image,
    isExternal: true,
    source: 'ticketmaster',
    external_url: `https://www.ticketmaster.com/event/${e.id}`,
    attendees: [],
    user_id: null,
    visibility: 2,
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const seatgeekId = Deno.env.get('SEATGEEK_CLIENT_ID');
  const ticketmasterKey = Deno.env.get('TICKETMASTER_API_KEY');
  if (!seatgeekId && !ticketmasterKey) {
    return new Response(
      JSON.stringify({ error: 'Configure SEATGEEK_CLIENT_ID or TICKETMASTER_API_KEY', events: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  let body: { city?: string } = {};
  try {
    body = await req.json();
  } catch {
    // no body
  }
  const city = (body?.city || '').trim().split(',')[0].trim();
  if (!city) {
    return new Response(
      JSON.stringify({ error: 'city required', events: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const allEvents: Record<string, unknown>[] = [];
  const errors: string[] = [];

  // SeatGeek
  if (seatgeekId) {
    const params = new URLSearchParams({
      'venue.city': city,
      per_page: '20',
      'datetime_local.gte': new Date().toISOString(),
      client_id: seatgeekId,
    });
    const secret = Deno.env.get('SEATGEEK_CLIENT_SECRET');
    if (secret) params.set('client_secret', secret);
    const res = await fetch(`${SEATGEEK_BASE}?${params}`);
    const json = (await res.json().catch(() => ({}))) as { events?: Record<string, unknown>[]; error?: string; message?: string };
    if (res.ok) {
      allEvents.push(...(json.events || []).map(normalizeSeatGeek));
    } else {
      errors.push(`SeatGeek: ${json?.error || json?.message || res.statusText}`);
    }
  }

  // Ticketmaster
  if (ticketmasterKey) {
    const now = new Date();
    const startDateTime = now.toISOString().slice(0, 19) + 'Z';
    const tmParams = new URLSearchParams({
      apikey: ticketmasterKey,
      city,
      countryCode: 'US',
      size: '20',
      startDateTime,
    });
    const tmRes = await fetch(`${TICKETMASTER_BASE}?${tmParams}`);
    const tmJson = (await tmRes.json().catch(() => ({}))) as {
      _embedded?: { events?: Record<string, unknown>[] };
      fault?: { faultstring?: string };
    };
    if (tmRes.ok && tmJson._embedded?.events) {
      allEvents.push(...tmJson._embedded.events.map(normalizeTicketmaster));
    } else if (!tmRes.ok) {
      errors.push(`Ticketmaster: ${tmJson?.fault?.faultstring || tmRes.statusText}`);
    }
  }

  // Deduplicate: same date + similar title + same venue/location = one event (keep best image)
  const slug = (s: string) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().replace(/[^\w\s]/g, '').slice(0, 80);
  const eventKey = (ev: Record<string, unknown>) => `${ev.date}|${slug(ev.title as string)}|${slug(ev.location as string)}`;
  const seen = new Map<string, Record<string, unknown>>();
  for (const ev of allEvents) {
    const key = eventKey(ev);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, ev);
      continue;
    }
    const hasImg = (e: Record<string, unknown>) => typeof e.image === 'string' && (e.image as string).startsWith('http');
    if (hasImg(ev) && !hasImg(existing)) seen.set(key, ev);
    else if (hasImg(ev) === hasImg(existing) && (ev.source === 'ticketmaster' && existing.source !== 'ticketmaster')) seen.set(key, ev);
  }
  const deduped = Array.from(seen.values());

  // Sort by date then time
  deduped.sort((a, b) => {
    const dA = (a.date as string) || '';
    const dB = (b.date as string) || '';
    if (dA !== dB) return dA.localeCompare(dB);
    const tA = (a.time as string) || '';
    const tB = (b.time as string) || '';
    return tA.localeCompare(tB);
  });

  // Persist so everyone can see them via get_external_events_by_city
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceRoleKey && deduped.length > 0) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date().toISOString();
    const rows = deduped.map((ev: Record<string, unknown>) => ({
      external_id: ev.external_id ?? ev.id,
      city,
      title: ev.title,
      date: (ev.date as string) || null,
      time: (ev.time as string) || null,
      location: (ev.location as string) || null,
      address: (ev.address as string) || null,
      image: (ev.image as string) || null,
      source: (ev.source as string) || 'seatgeek',
      external_url: (ev.external_url as string) || null,
      updated_at: now,
    }));
    const { error: upsertErr } = await supabase.from('external_events').upsert(rows, {
      onConflict: 'external_id',
      ignoreDuplicates: false,
    });
    if (upsertErr) console.error('external_events upsert:', upsertErr.message);
  }

  const responseError = errors.length > 0 ? errors.join('; ') : null;
  return new Response(JSON.stringify({ events: deduped, error: responseError }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});
