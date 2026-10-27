// SAMPLE DATA (starter only). This file is bundled into the BROWSER code.
//
// In sample data mode, EventsApp.js reads these objects directly, so no HTTP
// request happens and nothing comes from the database. After STUDENT CHANGE 1,
// the real list comes from GET /api/events instead and this file is no longer used.
//
// The objects use the same shape as the API response, so the UI does not change.
// Dates are calculated from "today" so the events always look upcoming.

function daysFromNow(days, hour) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "[Sample] Welcome Back Board Game Night",
    description: "Sample data only. Meet other students over cooperative board games. Snacks provided. No experience needed.",
    location: "Maple Hall Lounge (fictional)",
    startsAt: daysFromNow(7, 18),
  },
  {
    id: 2,
    title: "[Sample] Accessible Design Workshop",
    description: "Sample data only. A hands-on session on color contrast, keyboard navigation, and clear form labels.",
    location: "Innovation Lab, Room 204 (fictional)",
    startsAt: daysFromNow(14, 15),
  },
  {
    id: 3,
    title: "[Sample] Portfolio Review Night",
    description: "Sample data only. Bring a project you are proud of and get friendly feedback from peers and alumni.",
    location: "Library Commons (fictional)",
    startsAt: daysFromNow(21, 17),
  },
  {
    id: 4,
    title: "[Sample] Outdoor Movie on the Quad",
    description: "Sample data only. Bring a blanket for a family-friendly film under the stars. Rain location: Student Center.",
    location: "North Quad (fictional)",
    startsAt: daysFromNow(28, 19),
  },
];
