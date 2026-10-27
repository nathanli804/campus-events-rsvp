-- =====================================================================
-- Campus Events RSVP: sample data (four FICTIONAL events)
--
-- Run AFTER database/schema.sql, in the Supabase SQL Editor.
--
-- Safe to re-run: it empties both tables first and restarts the IDs, so
-- the events are always IDs 1–4 (the .http examples rely on that).
-- That also deletes any test RSVPs. Use this only in a teaching project.
--
-- Dates are calculated from TODAY (7, 14, 21 and 28 days ahead), so the
-- events stay upcoming whenever you run this. If they have passed, run
-- this file again.
--
-- Times below are 6 PM, 3 PM, 5 PM and 7 PM in UTC. To use your campus
-- time zone, replace 'UTC' with a name like 'America/New_York' or
-- 'Europe/London' (four places).
-- =====================================================================

truncate table rsvps, events restart identity;

insert into events (title, description, location, starts_at) values
  (
    'Welcome Back Board Game Night',
    'Meet other students over cooperative board games. Snacks provided. No experience needed.',
    'Maple Hall Lounge (fictional)',
    ((current_date + 7) + time '18:00') at time zone 'UTC'
  ),
  (
    'Accessible Design Workshop',
    'A hands-on session on color contrast, keyboard navigation, and clear form labels. Bring a laptop.',
    'Innovation Lab, Room 204 (fictional)',
    ((current_date + 14) + time '15:00') at time zone 'UTC'
  ),
  (
    'Portfolio Review Night',
    'Bring a project you are proud of and get friendly feedback from peers and alumni mentors.',
    'Library Commons (fictional)',
    ((current_date + 21) + time '17:00') at time zone 'UTC'
  ),
  (
    'Outdoor Movie on the Quad',
    'Bring a blanket for a family-friendly film under the stars. Rain location: Student Center.',
    'North Quad (fictional)',
    ((current_date + 28) + time '19:00') at time zone 'UTC'
  );

-- Check the result:
select id, title, starts_at from events order by starts_at;
