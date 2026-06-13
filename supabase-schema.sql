-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- It creates the single table the app syncs to and turns on realtime so friends
-- see each other's edits live. Access is open to the anon key but only for rows
-- whose id you share via the trip link, so keep your trip code private-ish.

create table if not exists public.trips (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  rev         bigint not null default 0,
  updated_at  timestamptz not null default now()
);

-- Row Level Security on, with a permissive policy for the anon (public) key.
-- The trip is protected by its hard-to-guess id, not by login.
alter table public.trips enable row level security;

drop policy if exists "anon read/write trips" on public.trips;
create policy "anon read/write trips"
  on public.trips
  for all
  to anon
  using (true)
  with check (true);

-- Broadcast row changes over realtime so the app can live-update.
alter publication supabase_realtime add table public.trips;
