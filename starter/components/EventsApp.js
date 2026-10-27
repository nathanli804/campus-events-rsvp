"use client";
// BROWSER CODE: the main screen. This file runs in the user's browser.
//
// STARTER: sample data mode. The interface is finished, but it is not yet
// connected to the API. You will make the marked STUDENT CHANGES below:
//
//   STUDENT CHANGE 1  read flow   replace SAMPLE_EVENTS with GET /api/events
//   STUDENT CHANGE 2  write flow  send the form with POST /api/rsvps
//   STUDENT CHANGE 3  clean up    remove the sample-mode banner and notice
//   EXTENSION         read flow   load details with GET /api/events/[id]
//
// Rule for every change: this file must only call OUR API routes with fetch().
// It must never import Supabase or use a database key.
import { useEffect, useState } from "react";
import EventList from "./EventList";
import EventDetails from "./EventDetails";
import RsvpForm from "./RsvpForm";
import RequestInspector from "./RequestInspector";


let nextLogId = 1;

export default function EventsApp() {
  const [events, setEvents] = useState([]);
  const [listState, setListState] = useState({ status: "loading", message: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState({ status: "idle", event: null, message: "" });
  const [requestLog, setRequestLog] = useState([]);

  // Adds one entry to the Request Inspector panel (teaching aid only).
  // Call it after each fetch(): logRequest("GET", "/api/events", response.status, body)
  function logRequest(method, path, status, body) {
    const entry = { id: nextLogId++, method, path, status, body };
    setRequestLog((previous) => [entry, ...previous].slice(0, 5));
  }

  // READ FLOW: runs once when the page opens.
  useEffect(() => {
    // ===== STUDENT CHANGE 1 START: GET /api/events =====
    async function loadEvents() {
      try {
        const response = await fetch("/api/events", { method: "GET" });
        const body = await response.json();
        logRequest("GET", "/api/events", response.status, body);

        if (response.ok) {
          setEvents(body.data);
          setListState({ status: "ready", message: "" });
        } else {
          setListState({ status: "error", message: body.error?.message ?? "Could not load events." });
        }
      } catch {
        setListState({ status: "error", message: "Could not reach the API. Check your connection and try again." });
      }
    }
    loadEvents();
    // ===== STUDENT CHANGE 1 END =====
  }, []);

  // Shows the selected event's details.
  function selectEvent(id) {
    setSelectedId(id);
    // ===== EXTENSION START (optional): load details with GET /api/events/[id] =====
    // Right now we reuse the event that is already in the list.
    // Extension: fetch(`/api/events/${id}`, { method: "GET" }) instead, with
    // "loading" and "error" states, like STUDENT CHANGE 1.
    const event = events.find((item) => item.id === id);
    setDetails({ status: "ready", event, message: "" });
    // ===== EXTENSION END =====
  }

  // WRITE FLOW: called by RsvpForm with { eventId, name, email }.
  // Must return { kind: "success" | "error" | "notice", message } for the form to display.
  async function submitRsvp(rsvp) {
        // ===== STUDENT CHANGE 2 START: POST /api/rsvps =====
    try {
      const response = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rsvp),
      });
      const body = await response.json();
      logRequest("POST", "/api/rsvps", response.status, body);

      if (response.ok) {
        return { kind: "success", message: body.message };
      }
      return { kind: "error", message: body.error?.message ?? "The RSVP could not be saved." };
    } catch {
      return { kind: "error", message: "Could not reach the API. Check your connection and try again." };
    }
    // ===== STUDENT CHANGE 2 END =====
  }

  return (
    <>
      <header className="site-header">
        <h1>Campus Events</h1>
        <p>Fictional events for a class exercise. Use fictional names and emails only.</p>
      </header>

      <main className="layout">
        <section className="panel" aria-labelledby="events-heading">
          <h2 id="events-heading">Upcoming events</h2>
          <EventList events={events} listState={listState} selectedId={selectedId} onSelect={selectEvent} />
        </section>

        <section className="panel" aria-labelledby="details-heading">
          <h2 id="details-heading">Event details</h2>
          <EventDetails details={details} />
          {details.event && (
            <RsvpForm
              key={details.event.id}
              event={details.event}
              onSubmitRsvp={submitRsvp}
            />
          )}
        </section>

        <RequestInspector
          entries={requestLog}
        />
      </main>
    </>
  );
}
