"use client";
// BROWSER CODE: the RSVP form. It collects input and hands it to
// onSubmitRsvp(), which EventsApp.js sends to the API.
//
// `required` and type="email" are browser conveniences only. The server
// (app/api/rsvps/route.js) repeats every check, because anyone can skip this form.
import { useState } from "react";

export default function RsvpForm({ event, onSubmitRsvp, starterNotice }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // result looks like { kind: "success" | "error" | "notice", message: "..." }
  const [result, setResult] = useState(null);

  async function handleSubmit(formEvent) {
    formEvent.preventDefault(); // stop the browser's default full-page form submit
    setSubmitting(true);
    setResult(null);

    const outcome = await onSubmitRsvp({ eventId: event.id, name, email });

    setResult(outcome);
    if (outcome.kind === "success") {
      setName("");
      setEmail("");
    }
    setSubmitting(false);
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit} aria-labelledby="rsvp-heading">
      <h3 id="rsvp-heading">RSVP for “{event.title}”</h3>

      {starterNotice && <p className="message notice">{starterNotice}</p>}

      <p className="hint">
        Use a <strong>fictional</strong> name and email only, for example “Alex Example” and alex@example.com.
      </p>

      <div className="field">
        <label htmlFor="rsvp-name">Name</label>
        <input
          id="rsvp-name"
          name="name"
          required
          maxLength={100}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="rsvp-email">Email</label>
        <input
          id="rsvp-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Sending…" : "Send RSVP"}
      </button>

      {result && (
        <p role={result.kind === "error" ? "alert" : "status"} className={`message ${result.kind}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}
