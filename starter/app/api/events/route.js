// GET /api/events  ->  200 { "data": [ ...events in date order ] }
//
// SERVER CODE: this route handler runs inside Next.js on the server, never in
// the browser. The browser will reach it with fetch("/api/events", { method: "GET" }).
//
// STARTER: not implemented yet. It returns 501 Not Implemented until you finish it.
// A finished example to compare with: app/api/events/[id]/route.js
//
// TODO 1: Import getSupabase from "@/lib/supabase-server",
//         PUBLIC_EVENT_COLUMNS and toPublicEvent from "@/lib/events",
//         and dataResponse and serverErrorResponse from "@/lib/api-response".
// TODO 2: Add `export const dynamic = "force-dynamic";` to explicitly run this
//         handler at request time, with fresh database reads (no Next.js cache).
//         GET handlers are already uncached by default in this Next.js version.
//         Other dynamic values: "auto" (default), "force-static" (cache),
//         "error" (require static behavior). Keep "force-dynamic" for this activity.
//         See the root README: "Why force-dynamic?" for the comparison.
// TODO 3: Inside a try block, select PUBLIC_EVENT_COLUMNS from the "events" table,
//         ordered by starts_at ascending (earliest first).
// TODO 4: If Supabase returns an error, throw it so the catch block handles it.
// TODO 5: Convert each row with toPublicEvent() and return dataResponse(events).
//         An empty table must return 200 { "data": [] }, not an error.
// TODO 6: In the catch block, return serverErrorResponse("GET /api/events", error).
//         Never send raw database errors to the browser.
import { notImplementedResponse } from "@/lib/api-response";

export async function GET() {
  return notImplementedResponse("GET /api/events", "app/api/events/route.js");
}
