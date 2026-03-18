-- One shared event (and one group chat) per external event so everyone who adds it sees the same conversation.

-- Allow events to be keyed by external id (e.g. "tm-123", "ext-456") so we can join the same event.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_events_external_id ON public.events (external_id) WHERE external_id IS NOT NULL;

-- Join an existing event that was created from an external source. Adds current user as attendee and to the event's conversation.
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

COMMENT ON COLUMN public.events.external_id IS 'Set when event was added from Discover (SeatGeek/Ticketmaster). Same external_id = one shared event and one group chat.';

-- IMPORTANT: Your create_event_with_invites RPC must set events.external_id when creating an event.
-- When event_data contains "external_id" (e.g. from Add to calendar on Discover), copy it into the new event row
-- so that join_external_event can find it and others can join the same event/chat.
-- Example: in the INSERT into events, add: external_id => (event_data->>'external_id')
