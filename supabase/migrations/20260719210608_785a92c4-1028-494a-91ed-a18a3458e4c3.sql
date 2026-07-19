
-- 1. Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Agent rules per user
CREATE TABLE IF NOT EXISTS public.agent_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  aggressiveness text NOT NULL DEFAULT 'balanced' CHECK (aggressiveness IN ('conservative','balanced','aggressive')),
  min_size_mb numeric NOT NULL DEFAULT 1,
  excluded_paths text[] NOT NULL DEFAULT ARRAY[]::text[],
  excluded_extensions text[] NOT NULL DEFAULT ARRAY[]::text[],
  undo_window_days integer NOT NULL DEFAULT 30 CHECK (undo_window_days IN (7,30,90)),
  auto_delete boolean NOT NULL DEFAULT true,
  notifications_enabled boolean NOT NULL DEFAULT true,
  paused_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_rules TO authenticated;
GRANT ALL ON public.agent_rules TO service_role;
ALTER TABLE public.agent_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rules" ON public.agent_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own rules" ON public.agent_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rules" ON public.agent_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rules" ON public.agent_rules FOR DELETE USING (auth.uid() = user_id);

-- 3. Devices (browser extension installs)
CREATE TABLE IF NOT EXISTS public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Navegador',
  user_agent text,
  device_token text NOT NULL UNIQUE,
  pairing_code text UNIQUE,
  pairing_code_expires_at timestamptz,
  paired_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own devices" ON public.devices FOR DELETE USING (auth.uid() = user_id);

-- 4. Generate pairing code (called by authenticated user from dashboard)
CREATE OR REPLACE FUNCTION public.create_pairing_code()
RETURNS TABLE(code text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code text;
  v_expires timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  v_code := lpad(floor(random()*1000000)::text, 6, '0');
  v_expires := now() + interval '10 minutes';
  INSERT INTO public.devices (user_id, pairing_code, pairing_code_expires_at, device_token, name)
  VALUES (auth.uid(), v_code, v_expires, encode(gen_random_bytes(24), 'hex'), 'Extensión pendiente');
  RETURN QUERY SELECT v_code, v_expires;
END;
$$;

-- 5. Redeem pairing code (called from public API by the extension, service role)
CREATE OR REPLACE FUNCTION public.redeem_pairing_code(p_code text, p_user_agent text)
RETURNS TABLE(device_token text, user_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_device public.devices%ROWTYPE;
BEGIN
  SELECT * INTO v_device FROM public.devices
    WHERE pairing_code = p_code
      AND pairing_code_expires_at > now()
      AND paired_at IS NULL
    LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid or expired code'; END IF;
  UPDATE public.devices
    SET paired_at = now(),
        user_agent = p_user_agent,
        name = COALESCE(NULLIF(split_part(p_user_agent, ' ', 1), ''), 'Navegador'),
        pairing_code = NULL,
        pairing_code_expires_at = NULL,
        last_seen_at = now()
    WHERE id = v_device.id;
  RETURN QUERY SELECT v_device.device_token, v_device.user_id;
END;
$$;

-- 6. Restore a cleanup action
CREATE OR REPLACE FUNCTION public.restore_action(p_action_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.cleanup_actions
    SET action_type = 'restaurado'
    WHERE id = p_action_id AND user_id = auth.uid() AND action_type = 'eliminado';
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_pairing_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_action(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_pairing_code(text, text) TO service_role;
