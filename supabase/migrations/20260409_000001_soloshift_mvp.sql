create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  timezone text not null default 'Asia/Seoul',
  default_check_in_time text not null default '10:00',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  local_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  today_goal text not null,
  today_first_task text not null,
  tomorrow_first_task text,
  daily_review text,
  goal_completed boolean not null default false,
  total_work_minutes integer not null default 0,
  total_focus_minutes integer not null default 0,
  total_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, local_date)
);

create table if not exists public.status_logs (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays (id) on delete cascade,
  status_type text not null check (status_type in ('study_algorithm', 'portfolio', 'resume', 'break', 'meal', 'away')),
  start_at timestamptz not null,
  end_at timestamptz,
  memo text
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays (id) on delete cascade,
  status_log_id uuid not null references public.status_logs (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,
  duration_minutes integer not null,
  memo text,
  is_completed boolean not null default false
);

create table if not exists public.point_events (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays (id) on delete cascade,
  event_type text not null check (event_type in ('check_in_on_time', 'check_in_minor_late', 'check_in_late', 'focus_session_complete', 'goal_completed', 'daily_review_submitted', 'five_day_streak_bonus')),
  points integer not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workdays_user_date_idx on public.workdays (user_id, local_date desc);
create index if not exists status_logs_workday_idx on public.status_logs (workday_id, start_at desc);
create index if not exists focus_sessions_workday_idx on public.focus_sessions (workday_id, start_at desc);
create index if not exists point_events_workday_idx on public.point_events (workday_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.workdays enable row level security;
alter table public.status_logs enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.point_events enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "workdays_select_own" on public.workdays
  for select using (auth.uid() = user_id);
create policy "workdays_insert_own" on public.workdays
  for insert with check (auth.uid() = user_id);
create policy "workdays_update_own" on public.workdays
  for update using (auth.uid() = user_id);

create policy "status_logs_select_own" on public.status_logs
  for select using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = status_logs.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "status_logs_insert_own" on public.status_logs
  for insert with check (
    exists (
      select 1 from public.workdays
      where public.workdays.id = status_logs.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "status_logs_update_own" on public.status_logs
  for update using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = status_logs.workday_id and public.workdays.user_id = auth.uid()
    )
  );

create policy "focus_sessions_select_own" on public.focus_sessions
  for select using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = focus_sessions.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "focus_sessions_insert_own" on public.focus_sessions
  for insert with check (
    exists (
      select 1 from public.workdays
      where public.workdays.id = focus_sessions.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "focus_sessions_update_own" on public.focus_sessions
  for update using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = focus_sessions.workday_id and public.workdays.user_id = auth.uid()
    )
  );

create policy "point_events_select_own" on public.point_events
  for select using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = point_events.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "point_events_insert_own" on public.point_events
  for insert with check (
    exists (
      select 1 from public.workdays
      where public.workdays.id = point_events.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "point_events_update_own" on public.point_events
  for update using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = point_events.workday_id and public.workdays.user_id = auth.uid()
    )
  );
