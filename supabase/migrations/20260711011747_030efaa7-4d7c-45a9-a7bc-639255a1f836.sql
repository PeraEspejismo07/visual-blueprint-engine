
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now(),
  streak_days int default 0,
  last_active_at timestamptz default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null check (provider in ('google_drive','browser_extension')),
  access_token text,
  refresh_token text,
  extension_device_id text unique,
  pairing_code text,
  pairing_code_expires_at timestamptz,
  connected_at timestamptz default now(),
  last_synced_at timestamptz,
  status text default 'active' check (status in ('active','disconnected','error')),
  unique(user_id, provider)
);
grant select, insert, update, delete on public.connections to authenticated;
grant all on public.connections to service_role;
alter table public.connections enable row level security;
create policy "Users view own conn" on public.connections for select using (auth.uid() = user_id);
create policy "Users insert own conn" on public.connections for insert with check (auth.uid() = user_id);
create policy "Users update own conn" on public.connections for update using (auth.uid() = user_id);
create policy "Users delete own conn" on public.connections for delete using (auth.uid() = user_id);

create table if not exists public.cleanup_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  source text not null check (source in ('drive','gmail','browser_tabs','downloads')),
  action_type text not null check (action_type in ('deleted','archived','tab_closed')),
  file_name text,
  size_bytes bigint default 0,
  co2_grams_saved numeric default 0,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.cleanup_actions to authenticated;
grant all on public.cleanup_actions to service_role;
alter table public.cleanup_actions enable row level security;
create policy "Users view own actions" on public.cleanup_actions for select using (auth.uid() = user_id);
create policy "Users insert own actions" on public.cleanup_actions for insert with check (auth.uid() = user_id);

create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  gb_freed numeric default 0,
  co2_kg_saved numeric default 0,
  actions_count int default 0,
  unique(user_id, date)
);
grant select, insert, update, delete on public.daily_metrics to authenticated;
grant all on public.daily_metrics to service_role;
alter table public.daily_metrics enable row level security;
create policy "Users view own metrics" on public.daily_metrics for select using (auth.uid() = user_id);
create policy "Users insert own metrics" on public.daily_metrics for insert with check (auth.uid() = user_id);
create policy "Users update own metrics" on public.daily_metrics for update using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.upsert_daily_metric(p_user_id uuid, p_gb numeric, p_co2 numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_metrics (user_id, date, gb_freed, co2_kg_saved, actions_count)
  values (p_user_id, current_date, p_gb, p_co2, 1)
  on conflict (user_id, date)
  do update set
    gb_freed = daily_metrics.gb_freed + excluded.gb_freed,
    co2_kg_saved = daily_metrics.co2_kg_saved + excluded.co2_kg_saved,
    actions_count = daily_metrics.actions_count + 1;
end;
$$;

create or replace function public.update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last date;
begin
  select last_active_at::date into v_last from public.profiles where id = p_user_id;
  if v_last = current_date then return;
  elsif v_last = current_date - interval '1 day' then
    update public.profiles set streak_days = streak_days + 1, last_active_at = now() where id = p_user_id;
  else
    update public.profiles set streak_days = 1, last_active_at = now() where id = p_user_id;
  end if;
end;
$$;
