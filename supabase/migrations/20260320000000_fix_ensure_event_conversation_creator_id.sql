-- conversations.creator_id is NOT NULL; ensure_event_conversation must set it.

CREATE OR REPLACE FUNCTION public.ensure_event_conversation(p_event_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id uuid;
  v_creator_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_conv_id FROM conversations WHERE event_id = p_event_id LIMIT 1;
  IF v_conv_id IS NOT NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conv_id, v_uid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    RETURN v_conv_id;
  END IF;

  SELECT user_id INTO v_creator_id FROM events WHERE id = p_event_id;
  v_creator_id := COALESCE(v_creator_id, v_uid);

  INSERT INTO conversations (event_id, creator_id)
  VALUES (p_event_id, v_creator_id)
  RETURNING id INTO v_conv_id;

  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (v_conv_id, v_creator_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (v_conv_id, v_uid)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  RETURN v_conv_id;
END;
$$;
