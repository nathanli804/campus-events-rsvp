// BROWSER helper: shows an ISO timestamp in the viewer's own time zone.
export function formatDate(isoString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}
