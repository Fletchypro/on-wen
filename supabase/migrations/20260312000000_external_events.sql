-- External events cache: SeatGeek (and other sources) fetched by city.
-- Populated by the fetch-external-events Edge Function so everyone can see them.

CREATE TABLE IF NOT EXISTS public.external_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  city text NOT NULL,
  title text NOT NULL,
  date date,
  time text,
  location text,
  address text,
  image text,
  source text NOT NULL DEFAULT 'seatgeek',
  external_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_external_events_city ON public.external_events (lower(trim(city)));

ALTER TABLE public.external_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for authenticated and anon" ON public.external_events;
CREATE POLICY "Allow read for authenticated and anon"
  ON public.external_events FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only service role / Edge Function can insert/update (no policy = only service_role).
-- So we don't add INSERT/UPDATE policies for anon/authenticated.

COMMENT ON TABLE public.external_events IS 'Cached external API events (e.g. SeatGeek) by city for Discover Nearby.';

-- RPC: return external events for a city in the same shape as app events (with isExternal).
CREATE OR REPLACE FUNCTION public.get_external_events_by_city(p_city_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city text;
  v_result json;
BEGIN
  v_city := lower(trim(nullif(p_city_name, '')));
  IF v_city IS NULL OR v_city = '' THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', external_id,
      'title', title,
      'date', date::text,
      'time', time,
      'location', location,
      'address', address,
      'image', image,
      'isExternal', true,
      'source', source,
      'external_url', external_url,
      'attendees', '[]'::json,
      'user_id', null,
      'visibility', 2
    ) ORDER BY date NULLS LAST, time NULLS LAST
  )
  INTO v_result
  FROM external_events
  WHERE lower(trim(city)) = v_city
    AND (date IS NULL OR date >= current_date);

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;
