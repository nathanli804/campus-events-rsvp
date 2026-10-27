// The home page. Everything interactive lives in <EventsApp />, a Client
// Component that runs in the BROWSER and talks to our API with fetch().
import EventsApp from "@/components/EventsApp";

export default function HomePage() {
  return <EventsApp />;
}
