create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays (id) on delete cascade,
  title text not null,
  detail text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays (id) on delete cascade,
  event_type text not null check (
    event_type in (
      'check_in',
      'status_changed',
      'focus_session_started',
      'focus_session_completed',
      'focus_session_interrupted',
      'check_out',
      'task_created',
      'task_started',
      'task_completed',
      'task_reopened'
    )
  ),
  title text not null,
  description text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_workday_sort_idx on public.tasks (workday_id, sort_order asc, created_at asc);
create index if not exists activity_feed_workday_created_idx on public.activity_feed (workday_id, created_at desc);

alter table public.tasks enable row level security;
alter table public.activity_feed enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = tasks.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "tasks_insert_own" on public.tasks
  for insert with check (
    exists (
      select 1 from public.workdays
      where public.workdays.id = tasks.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "tasks_update_own" on public.tasks
  for update using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = tasks.workday_id and public.workdays.user_id = auth.uid()
    )
  );

create policy "activity_feed_select_own" on public.activity_feed
  for select using (
    exists (
      select 1 from public.workdays
      where public.workdays.id = activity_feed.workday_id and public.workdays.user_id = auth.uid()
    )
  );
create policy "activity_feed_insert_own" on public.activity_feed
  for insert with check (
    exists (
      select 1 from public.workdays
      where public.workdays.id = activity_feed.workday_id and public.workdays.user_id = auth.uid()
    )
  );
