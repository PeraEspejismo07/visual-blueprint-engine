
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.upsert_daily_metric(uuid, numeric, numeric) from public, anon, authenticated;
revoke execute on function public.update_streak(uuid) from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.upsert_daily_metric(uuid, numeric, numeric) to service_role;
grant execute on function public.update_streak(uuid) to service_role;
