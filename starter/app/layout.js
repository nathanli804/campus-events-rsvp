import "./globals.css";

export const metadata = {
  title: "Campus Events RSVP",
  description: "A fictional campus events app for tracing frontend → API → database.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
