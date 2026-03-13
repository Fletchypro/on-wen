-- Patch create_event_with_invites so new events from Discover get external_id set
-- (so join_external_event can find the same event and everyone shares one chat).
-- Run this once in Supabase SQL Editor or via supabase db push.

DO $$
DECLARE
  f_oid oid;
  def text;
  new_def text;
  vals_pos int;
BEGIN
  SELECT oid INTO f_oid FROM pg_proc WHERE proname = 'create_event_with_invites' LIMIT 1;
  IF f_oid IS NULL THEN
    RAISE NOTICE 'create_event_with_invites not found; skip or create it first.';
    RETURN;
  END IF;

  def := pg_get_functiondef(f_oid);

  -- Already patched?
  IF def ~ 'external_id' AND def ~ 'events' THEN
    RAISE NOTICE 'create_event_with_invites already references external_id; nothing to do.';
    RETURN;
  END IF;

  -- Add "external_id, " after "INSERT INTO public.events (" or "INSERT INTO events ("
  new_def := regexp_replace(
    def,
    '(?i)(INSERT INTO\s+(?:public\.)?events\s*\(\s*)',
    '\1external_id, '
  );

  -- Insert "(event_data->>'external_id'), " right after the first "VALUES ("
  vals_pos := position('values (' in lower(new_def));
  IF vals_pos > 0 THEN
    new_def := overlay(
      new_def placing '(event_data->>''external_id''), ' from vals_pos + 7 for 0
    );
  END IF;

  EXECUTE new_def;
  RAISE NOTICE 'create_event_with_invites updated to persist external_id.';
END;
$$;
