create table if not exists public.office_activity_events (
  id uuid primary key default gen_random_uuid(),
  office_slug text not null default 'soloshift-commons' check (office_slug = 'soloshift-commons'),
  user_id uuid not null references auth.users (id) on delete cascade,
  actor_nickname text not null,
  room_id text not null check (room_id in ('lobby', 'focus-room', 'lounge')),
  workday_id uuid references public.workdays (id) on delete set null,
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

create index if not exists office_activity_events_office_created_idx
  on public.office_activity_events (office_slug, created_at desc);

create index if not exists office_activity_events_room_created_idx
  on public.office_activity_events (office_slug, room_id, created_at desc);

create index if not exists office_activity_events_user_created_idx
  on public.office_activity_events (user_id, created_at desc);

alter table public.office_activity_events enable row level security;

create policy "office_activity_events_select_authenticated"
  on public.office_activity_events
  for select
  to authenticated
  using (
    office_slug = 'soloshift-commons'
  );

create policy "office_activity_events_insert_own"
  on public.office_activity_events
  for insert
  to authenticated
  with check (
    office_slug = 'soloshift-commons'
    and (select auth.uid()) = user_id
  );
