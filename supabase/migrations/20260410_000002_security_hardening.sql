update public.profiles
set timezone = 'Asia/Seoul'
where timezone not in (
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Australia/Sydney',
  'Pacific/Auckland'
);

update public.profiles
set default_check_in_time = '10:00'
where default_check_in_time !~ '^(?:[01]\d|2[0-3]):[0-5]\d$';

alter table public.profiles
  drop constraint if exists profiles_timezone_allowed;

alter table public.profiles
  add constraint profiles_timezone_allowed
  check (
    timezone in (
      'Asia/Seoul',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Bangkok',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Europe/London',
      'Europe/Berlin',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'Australia/Sydney',
      'Pacific/Auckland'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_default_check_in_time_valid;

alter table public.profiles
  add constraint profiles_default_check_in_time_valid
  check (default_check_in_time ~ '^(?:[01]\d|2[0-3]):[0-5]\d$');

create unique index if not exists status_logs_one_open_per_workday_idx
  on public.status_logs (workday_id)
  where end_at is null;

create unique index if not exists focus_sessions_one_open_per_workday_idx
  on public.focus_sessions (workday_id)
  where end_at is null;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "workdays_select_own" on public.workdays;
drop policy if exists "workdays_insert_own" on public.workdays;
drop policy if exists "workdays_update_own" on public.workdays;

create policy "workdays_select_own" on public.workdays
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "status_logs_select_own" on public.status_logs;
drop policy if exists "status_logs_insert_own" on public.status_logs;
drop policy if exists "status_logs_update_own" on public.status_logs;

create policy "status_logs_select_own" on public.status_logs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = status_logs.workday_id and public.workdays.user_id = auth.uid()
    )
  );

drop policy if exists "focus_sessions_select_own" on public.focus_sessions;
drop policy if exists "focus_sessions_insert_own" on public.focus_sessions;
drop policy if exists "focus_sessions_update_own" on public.focus_sessions;

create policy "focus_sessions_select_own" on public.focus_sessions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = focus_sessions.workday_id and public.workdays.user_id = auth.uid()
    )
  );

drop policy if exists "point_events_select_own" on public.point_events;
drop policy if exists "point_events_insert_own" on public.point_events;
drop policy if exists "point_events_update_own" on public.point_events;

create policy "point_events_select_own" on public.point_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = point_events.workday_id and public.workdays.user_id = auth.uid()
    )
  );

