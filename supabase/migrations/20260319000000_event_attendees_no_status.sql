-- event_attendees has only (event_id, user_id) in this project — no "status" column.
-- Replaces add_or_join_external_event and join_external_event accordingly.

CREATE OR REPLACE FUNCTION public.join_external_event(p_external_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_conv_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_external_id IS NULL OR trim(p_external_id) = '' THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  SELECT id INTO v_event_id FROM events WHERE external_id = trim(p_external_id) LIMIT 1;
  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  INSERT INTO event_attendees (event_id, user_id)
  SELECT v_event_id, v_uid
  WHERE NOT EXISTS (
    SELECT 1 FROM event_attendees ea
    WHERE ea.event_id = v_event_id AND ea.user_id = v_uid
  );

  SELECT id INTO v_conv_id FROM conversations WHERE event_id = v_event_id LIMIT 1;
  IF v_conv_id IS NOT NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conv_id, v_uid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('status', 'joined', 'event_id', v_event_id);
END;
$$;

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

  SELECT id INTO v_event_id FROM events WHERE external_id = v_ext_id LIMIT 1;
  IF v_event_id IS NOT NULL THEN
    INSERT INTO event_attendees (event_id, user_id)
    SELECT v_event_id, v_uid
    WHERE NOT EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = v_event_id AND ea.user_id = v_uid
    );

    SELECT id INTO v_conv_id FROM conversations WHERE event_id = v_event_id LIMIT 1;
    IF v_conv_id IS NOT NULL THEN
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (v_conv_id, v_uid)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object('status', 'joined', 'event_id', v_event_id);
  END IF;

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
    (nullif(trim(p_event_data->>'time'), ''))::time,
    nullif(trim(p_event_data->>'location'), ''),
    nullif(trim(p_event_data->>'address'), ''),
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

  INSERT INTO event_attendees (event_id, user_id)
  SELECT v_event_id, v_uid
  WHERE NOT EXISTS (
    SELECT 1 FROM event_attendees ea
    WHERE ea.event_id = v_event_id AND ea.user_id = v_uid
  );

  v_conv_id := ensure_event_conversation(v_event_id);

  RETURN jsonb_build_object('status', 'created', 'event_id', v_event_id);
END;
$$;
