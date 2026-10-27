// GET /api/events/[id]  ->  200 { "data": { ...one event } }
//                           400 if the id is malformed, 404 if no such event
//
// SERVER CODE: runs in Next.js on the server. The [id] folder name means
// /api/events/2 arrives here with params.id === "2" (always a string).
//
// STARTER: this route is PROVIDED COMPLETE as a worked example. Trace it in
// class, then use it as the pattern to compare against for GET /api/events.
// It needs .env.local; without it, it returns a helpful CONFIG_MISSING error.
import { getSupabase } from "@/lib/supabase-server";
import { PUBLIC_EVENT_COLUMNS, parseEventId, toPublicEvent } from "@/lib/events";
import { dataResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

// Explicitly run this GET at request time without Next.js response/data caching.
// GET is already uncached by default here; this makes our intent visible.
// Alternatives: "auto", "force-static", "error". See root README: "Why force-dynamic?".
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  // 1. Read and check the id from the URL before touching the database.
  const { id } = await params;
  const eventId = parseEventId(id);
  if (eventId === null) {
    return errorResponse(400, "INVALID_EVENT_ID", "Event ID must be a positive whole number, like /api/events/1.");
  }

  try {
    // 2. Ask for at most one matching row. maybeSingle() gives null if none.
    const { data, error } = await getSupabase()
      .from("events")
      .select(PUBLIC_EVENT_COLUMNS)
      .eq("id", eventId)
      .maybeSingle();

    if (error) throw error;

    // 3. No row means the event does not exist: 404, not 500.
    if (!data) {
      return errorResponse(404, "EVENT_NOT_FOUND", `No event exists with ID ${eventId}.`);
    }

    // 4. Send back only the public fields.
    return dataResponse(toPublicEvent(data));
  } catch (error) {
    return serverErrorResponse("GET /api/events/[id]", error);
  }
}
