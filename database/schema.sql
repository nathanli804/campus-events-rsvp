-- =====================================================================
-- Campus Events RSVP: database schema
--
-- Run this in the Supabase SQL Editor of an ISOLATED TEACHING PROJECT.
-- WARNING: it drops and recreates the two tables, deleting their data.
-- Then run database/seed.sql to add the sample events.
-- =====================================================================

drop table if exists rsvps;
drop table if exists events;

-- ---------------------------------------------------------------------
-- events: one row per campus event.
-- ---------------------------------------------------------------------
create table events (
  -- Primary key: a number the database generates, unique for every event.
  id          integer generated always as identity primary key,
  title       text        not null check (char_length(title) between 1 and 200),
  description text        not null check (char_length(description) between 1 and 2000),
  location    text        not null check (char_length(location) between 1 and 200),
  -- "with time zone" stores an exact moment; the browser shows it in local time.
  starts_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- rsvps: one row per person attending one event.
-- ---------------------------------------------------------------------
create table rsvps (
  id         integer generated always as identity primary key,

  -- Foreign key: every RSVP must point at an event that exists.
  -- "on delete cascade" removes an event's RSVPs if the event is deleted.
  event_id   integer not null references events (id) on delete cascade,

  name       text not null check (char_length(name) between 1 and 100),

  -- Backup checks: the API already trims and lowercases emails. These
  -- reject anything that skipped the API's normalization.
  email      text not null check (
               char_length(email) between 3 and 254
               and email = lower(btrim(email))
               and email like '%_@_%'
             ),

  created_at timestamptz not null default now(),

  -- Unique constraint: the same email can RSVP only once per event.
  -- (The same email may still RSVP to different events.)
  constraint rsvps_one_per_email_per_event unique (event_id, email)
);

-- Note: the unique constraint also creates an index on (event_id, email),
-- so looking up the RSVPs for one event is already fast.

-- ---------------------------------------------------------------------
-- Permissions
--
-- Our app connects ONLY from the Next.js server, using the secret key
-- (the "service_role" database role). Browsers never talk to these
-- tables directly.
--
-- 1. Turn on Row Level Security (RLS) and add NO policies. With RLS on and
--    no policies, the public "anon" and "authenticated" roles (used by the
--    publishable/anon key) cannot read or write any rows through
--    Supabase's own Data API.
-- 2. Remove the default table privileges Supabase gives those roles,
--    so access is blocked twice.
-- 3. Give service_role only what our three endpoints need. service_role
--    bypasses RLS, but it still needs these table privileges.
-- ---------------------------------------------------------------------
alter table events enable row level security;
alter table rsvps  enable row level security;

revoke all on table events, rsvps from anon, authenticated, service_role;

grant select         on table events to service_role;  -- GET /api/events, GET /api/events/[id]
grant select, insert on table rsvps  to service_role;  -- POST /api/rsvps (select = return the new id)
