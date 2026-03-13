-- One event per external_id: add or join in a single RPC so we always set external_id on create.
-- Frontend uses this instead of join_external_event + create_event_with_invites for Discover "Add to calendar".

CREATE OR REPLACE FUNCTION public.add_or_join_external_event(
  p_external_id text,
  p_event_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_event_id uuid;
  v_conv_id uuid;
  v_ext_id text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'error', 'not_authenticated');
  END IF;

  v_ext_id := trim(nullif(p_external_id, ''));
  IF v_ext_id = '' THEN
    RETURN jsonb_build_object('status', 'error', 'error', 'missing_external_id');
  END IF;

  -- Try to join existing event with this external_id
  SELECT id INTO v_event_id FROM events WHERE external_id = v_ext_id LIMIT 1;
  IF v_event_id IS NOT NULL THEN
    INSERT INTO event_attendees (event_id, user_id, status)
    VALUES (v_event_id, v_uid, 'accepted')
    ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'accepted';

    SELECT id INTO v_conv_id FROM conversations WHERE event_id = v_event_id LIMIT 1;
    IF v_conv_id IS NOT NULL THEN
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (v_conv_id, v_uid)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object('status', 'joined', 'event_id', v_event_id);
  END IF;

  -- Create new event with external_id set (so next person will join this one)
  INSERT INTO events (
    user_id,
    external_id,
    title,
    date,
    end_date,
    time,
    location,
    address,
    notes,
    priority,
    title_size,
    title_color,
    image,
    image_position,
    event_type,
    visibility,
    show_on_feed,
    tag_id
  ) VALUES (
    v_uid,
    v_ext_id,
    p_event_data->>'title',
    (p_event_data->>'date')::date,
    (p_event_data->>'end_date')::date,
    nullif(trim(p_event_data->>'time'), ''),
    nullif(trim(p_event_data->>'location'), ''),
    nullif(trim(p_event_data->>'notes'), ''),
    COALESCE((p_event_data->>'priority')::int, 1),
    COALESCE((p_event_data->>'title_size')::int, 16),
    COALESCE(nullif(trim(p_event_data->>'title_color'), ''), '#FFFFFF'),
    nullif(trim(p_event_data->>'image'), ''),
    COALESCE(nullif(trim(p_event_data->>'image_position'), ''), '50% 50%'),
    COALESCE(nullif(trim(p_event_data->>'event_type'), ''), 'personal'),
    COALESCE((p_event_data->>'visibility')::int, 1),
    COALESCE((p_event_data->>'show_on_feed')::boolean, false),
    (p_event_data->>'tag_id')::uuid
  )
  RETURNING id INTO v_event_id;

  INSERT INTO event_attendees (event_id, user_id, status)
  VALUES (v_event_id, v_uid, 'accepted')
  ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'accepted';

  v_conv_id := ensure_event_conversation(v_event_id);

  RETURN jsonb_build_object('status', 'created', 'event_id', v_event_id);
END;
$$;

COMMENT ON FUNCTION public.add_or_join_external_event IS 'Add current user to calendar for an external event: join existing event (same external_id) or create one with external_id set. One event id per public external event.';
