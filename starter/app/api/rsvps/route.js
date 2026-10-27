// POST /api/rsvps  ->  201 { "data": { "id", "eventId" }, "message" }
//                      400 bad JSON or invalid fields, 404 unknown event,
//                      409 duplicate RSVP, 500 unexpected server problem
//
// SERVER CODE: runs in Next.js on the server. Browser checks (like
// <input required>) are only a convenience. Anyone can send a request
// straight to this URL, so the real checks must happen here.
//
// STARTER: not implemented yet. It returns 501 Not Implemented until you finish it.
// Full contract: docs/api-reference.md
//
// TODO 1: Read the body with `await request.json()` inside try/catch.
//         Malformed JSON -> 400 { error: { code: "INVALID_JSON", ... } }.
// TODO 2: Validate on the server. Each failure -> 400 with code "VALIDATION_ERROR":
//         - body must be a JSON object
//         - eventId must pass isValidEventId() from "@/lib/events" (positive integer, not "1")
//         - name and email must be non-empty strings
// TODO 3: Normalize: trim name; trim AND lowercase email.
//         Limits: name <= 100 characters, email <= 254 characters,
//         email must match a basic pattern like /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// TODO 4: Using getSupabase(), check the event exists in "events".
//         No row -> 404 { error: { code: "EVENT_NOT_FOUND", ... } }.
// TODO 5: Insert { event_id, name, email } into "rsvps" and select back ONLY "id, event_id".
// TODO 6: Translate database errors:
//         code "23505" (unique violation)      -> 409 "DUPLICATE_RSVP"
//         code "23503" (foreign key violation) -> 404 "EVENT_NOT_FOUND"
//         anything else -> serverErrorResponse("POST /api/rsvps", error)
// TODO 7: Success -> createdResponse({ id, eventId }, "RSVP saved. See you there!")  (status 201).
//         Never return or console.log the name or email.
import { notImplementedResponse } from "@/lib/api-response";

export async function POST() {
  return notImplementedResponse("POST /api/rsvps", "app/api/rsvps/route.js");
}
