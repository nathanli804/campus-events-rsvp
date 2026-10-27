// POST /api/rsvps  ->  201 { "data": { "id", "eventId" }, "message" }
//                      400 bad JSON or invalid fields, 404 unknown event,
//                      409 duplicate RSVP, 500 unexpected server problem
//
// SERVER CODE: runs in Next.js on the server. Browser checks (like
// <input required>) are only a convenience. Anyone can send a request
// straight to this URL, so the real checks must happen here.
import { getSupabase } from "@/lib/supabase-server";
import { isValidEventId } from "@/lib/events";
import { createdResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invalid(message) {
  return errorResponse(400, "VALIDATION_ERROR", message);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return invalid("Request body must be a JSON object.");
  }

  const { eventId, name, email } = body;

  if (!isValidEventId(eventId)) {
    return invalid("eventId must be a positive whole number, like 1.");
  }
  if (typeof name !== "string" || name.trim() === "") {
    return invalid("Name is required.");
  }
  if (typeof email !== "string" || email.trim() === "") {
    return invalid("Email is required.");
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length > 100) {
    return invalid("Name must be 100 characters or fewer.");
  }
  if (cleanEmail.length > 254) {
    return invalid("Email must be 254 characters or fewer.");
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return invalid("Email must look like name@example.com.");
  }

  try {
    const supabase = getSupabase();

    const { data: event, error: lookupError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!event) {
      return errorResponse(404, "EVENT_NOT_FOUND", `No event exists with ID ${eventId}.`);
    }

    const { data: rsvp, error: insertError } = await supabase
      .from("rsvps")
      .insert({ event_id: eventId, name: cleanName, email: cleanEmail })
      .select("id, event_id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return errorResponse(409, "DUPLICATE_RSVP", "This email has already RSVPed for this event.");
      }
      if (insertError.code === "23503") {
        return errorResponse(404, "EVENT_NOT_FOUND", `No event exists with ID ${eventId}.`);
      }
      throw insertError;
    }

    return createdResponse({ id: rsvp.id, eventId: rsvp.event_id }, "RSVP saved. See you there!");
  } catch (error) {
    return serverErrorResponse("POST /api/rsvps", error);
  }
}