"use client";
// BROWSER CODE: shows the selected event, or a loading/error/empty message.
import { formatDate } from "./format-date";

export default function EventDetails({ details }) {
  if (details.status === "idle") {
    return <p className="hint">Select an event from the list to see its details.</p>;
  }

  if (details.status === "loading") {
    return <p role="status">Loading event details…</p>;
  }

  if (details.status === "error") {
    return (
      <p role="alert" className="message error">
        {details.message}
      </p>
    );
  }

  const { event } = details;
  return (
    <article className="event-details" aria-live="polite">
      <h3>{event.title}</h3>
      <dl>
        <dt>When</dt>
        <dd>
          <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
        </dd>
        <dt>Where</dt>
        <dd>{event.location}</dd>
      </dl>
      <p>{event.description}</p>
    </article>
  );
}
