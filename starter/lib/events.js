// SERVER-ONLY: small helpers shared by the event and RSVP route handlers.
import "server-only";

// The only event columns our public API returns.
// RSVP names and emails are never read by any public GET endpoint.
export const PUBLIC_EVENT_COLUMNS = "id, title, description, location, starts_at";

// The database uses snake_case column names; our JSON API uses camelCase.
// This is where the API decides what the outside world sees.
export function toPublicEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startsAt: row.starts_at,
  };
}

// Largest value a Postgres `integer` column can store.
const MAX_DB_INTEGER = 2147483647;

// For JSON bodies: eventId must be a real number like 1, not "1" or 1.5.
export function isValidEventId(value) {
  return Number.isInteger(value) && value > 0 && value <= MAX_DB_INTEGER;
}

// For URLs: /api/events/12 gives us the STRING "12". Returns a number, or null if malformed.
export function parseEventId(text) {
  if (typeof text !== "string" || !/^[1-9][0-9]*$/.test(text)) return null;
  const id = Number(text);
  return isValidEventId(id) ? id : null;
}
