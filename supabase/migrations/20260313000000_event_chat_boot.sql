-- Event group chat: vote-to-boot (5 votes = user is locked from sending more messages).

-- Votes to remove a user from an event's chat. One vote per (voter, target) per event.
CREATE TABLE IF NOT EXISTS public.event_chat_boot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voted_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, target_user_id, voted_by_user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_chat_boot_votes_event_target ON public.event_chat_boot_votes (event_id, target_user_id);

ALTER TABLE public.event_chat_boot_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage own vote" ON public.event_chat_boot_votes;
CREATE POLICY "Authenticated can manage own vote"
  ON public.event_chat_boot_votes FOR ALL
  TO authenticated
  USING (voted_by_user_id = auth.uid())
  WITH CHECK (voted_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated can read votes for event" ON public.event_chat_boot_votes;
CREATE POLICY "Authenticated can read votes for event"
  ON public.event_chat_boot_votes FOR SELECT
  TO authenticated
  USING (true);

-- Users who are locked from sending messages in an event's chat (5+ votes).
CREATE TABLE IF NOT EXISTS public.event_chat_banned (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE public.event_chat_banned ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read event_chat_banned" ON public.event_chat_banned;
CREATE POLICY "Authenticated can read event_chat_banned"
  ON public.event_chat_banned FOR SELECT
  TO authenticated
  USING (true);

-- Only RPC can insert (no INSERT policy for users; vote_to_boot_event_chat uses SECURITY DEFINER).

-- Vote to boot a user. When they reach 5 votes, they are added to event_chat_banned.
CREATE OR REPLACE FUNCTION public.vote_to_boot_event_chat(p_event_id uuid, p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_count bigint;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_target_user_id = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_vote_self');
  END IF;

  INSERT INTO event_chat_boot_votes (event_id, target_user_id, voted_by_user_id)
  VALUES (p_event_id, p_target_user_id, v_uid)
  ON CONFLICT (event_id, target_user_id, voted_by_user_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count
  FROM event_chat_boot_votes
  WHERE event_id = p_event_id AND target_user_id = p_target_user_id;

  IF v_count >= 5 THEN
    INSERT INTO event_chat_banned (event_id, user_id)
    VALUES (p_event_id, p_target_user_id)
    ON CONFLICT (event_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('ok', true, 'vote_count', v_count, 'banned', v_count >= 5);
END;
$$;

-- Get vote counts per user for an event (for UI).
CREATE OR REPLACE FUNCTION public.get_event_chat_boot_counts(p_event_id uuid)
RETURNS TABLE(target_user_id uuid, vote_count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT v.target_user_id, COUNT(*)::bigint
  FROM event_chat_boot_votes v
  WHERE v.event_id = p_event_id
  GROUP BY v.target_user_id;
$$;

-- Check if a user is banned from an event's chat.
CREATE OR REPLACE FUNCTION public.is_user_banned_from_event_chat(p_event_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_chat_banned
    WHERE event_id = p_event_id AND user_id = p_user_id
  );
$$;

COMMENT ON TABLE public.event_chat_boot_votes IS 'Votes to remove a user from an event group chat; 5 votes = banned.';
COMMENT ON TABLE public.event_chat_banned IS 'Users who cannot send messages in an event chat (5+ boot votes).';

-- Ensure a group chat exists for an event (e.g. when someone adds a public event to calendar).
-- Creates conversation and adds event creator + current user as participants if not exists.
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
  INSERT INTO conversations (event_id, creator_id) VALUES (p_event_id, v_creator_id) RETURNING id INTO v_conv_id;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (v_conv_id, v_creator_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (v_conv_id, v_uid)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  RETURN v_conv_id;
END;
$$;
