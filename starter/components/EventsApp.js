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
import { SAMPLE_EVENTS } from "./sample-data"; // remove after STUDENT CHANGE 1

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
    // ===== STUDENT CHANGE 1 START: replace sample data with GET /api/events =====
    // Right now the events come from components/sample-data.js, which is already
    // in the browser. No HTTP request happens, so DevTools → Network shows nothing.
    //
    // Goal: call fetch("/api/events", { method: "GET" }), read the JSON body,
    // call logRequest(...), then:
    //   - if response.ok: setEvents(body.data) and setListState({ status: "ready", message: "" })
    //   - otherwise:      setListState({ status: "error", message: body.error.message })
    //   - if fetch throws: setListState({ status: "error", message: "Could not reach the API..." })
    setEvents(SAMPLE_EVENTS);
    setListState({ status: "ready", message: "" });
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
    // ===== STUDENT CHANGE 2 START: send the RSVP with POST /api/rsvps =====
    // Right now nothing is sent anywhere. The `rsvp` object is ignored.
    //
    // Goal: call fetch("/api/rsvps", { method: "POST", headers: { "Content-Type": "application/json" },
    // body: JSON.stringify(rsvp) }), read the JSON body, call logRequest(...), then return:
    //   - if response.ok:  { kind: "success", message: body.message }
    //   - otherwise:       { kind: "error", message: body.error.message }
    //   - if fetch throws: { kind: "error", message: "Could not reach the API..." }
    // Do not console.log the rsvp object: it contains a name and email.
    return {
      kind: "notice",
      message: "Starter mode: nothing was saved. This form does not send data yet (STUDENT CHANGE 2).",
    };
    // ===== STUDENT CHANGE 2 END =====
  }

  return (
    <>
      <header className="site-header">
        <h1>Campus Events</h1>
        <p>Fictional events for a class exercise. Use fictional names and emails only.</p>
      </header>

      {/* ===== STUDENT CHANGE 3: delete this banner after changes 1 and 2 work ===== */}
      <p className="banner" role="note">
        Sample data mode: database/API connection not completed. Events below are sample data from
        components/sample-data.js, and RSVPs are not saved.
      </p>

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
              // STUDENT CHANGE 3: delete the starterNotice line below after change 2 works.
              starterNotice="Starter mode: this form does not save yet."
            />
          )}
        </section>

        <RequestInspector
          entries={requestLog}
          // STUDENT CHANGE 3: delete the emptyMessage line below after change 1 works.
          emptyMessage="No API requests yet. In sample data mode, events are read from a file already in the browser, so nothing crosses the network."
        />
      </main>
    </>
  );
}
