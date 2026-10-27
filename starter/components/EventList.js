"use client";
// BROWSER CODE: shows the list of events. It only displays what it is given.
// It does not fetch anything itself.
import { formatDate } from "./format-date";

export default function EventList({ events, listState, selectedId, onSelect }) {
  if (listState.status === "loading") {
    return <p role="status">Loading events…</p>;
  }

  if (listState.status === "error") {
    return (
      <p role="alert" className="message error">
        {listState.message}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p role="status" className="message notice">
        No events yet. If you expected some, run database/seed.sql in your Supabase project.
      </p>
    );
  }

  return (
    <ul className="event-list">
      {events.map((event) => (
        <li key={event.id}>
          <button
            type="button"
            className="event-button"
            aria-pressed={event.id === selectedId}
            onClick={() => onSelect(event.id)}
          >
            <span className="event-title">{event.title}</span>
            <span className="event-meta">
              {formatDate(event.startsAt)} · {event.location}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
