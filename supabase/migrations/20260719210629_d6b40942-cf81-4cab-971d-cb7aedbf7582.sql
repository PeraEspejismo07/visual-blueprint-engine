
REVOKE EXECUTE ON FUNCTION public.create_pairing_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.restore_action(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_pairing_code(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_streak(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_daily_metric(uuid, numeric, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.update_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_daily_metric(uuid, numeric, numeric) TO service_role;
