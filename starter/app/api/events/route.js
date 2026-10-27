// GET /api/events  ->  200 { "data": [ ...events in date order ] }
//
// SERVER CODE: runs inside Next.js on the server, never in the browser.
// The browser reaches it with fetch("/api/events", { method: "GET" }).
import { getSupabase } from "@/lib/supabase-server";
import { PUBLIC_EVENT_COLUMNS, toPublicEvent } from "@/lib/events";
import { dataResponse, serverErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("events")
      .select(PUBLIC_EVENT_COLUMNS)
      .order("starts_at", { ascending: true });

    if (error) throw error;

    return dataResponse((data ?? []).map(toPublicEvent));
  } catch (error) {
    return serverErrorResponse("GET /api/events", error);
  }
}