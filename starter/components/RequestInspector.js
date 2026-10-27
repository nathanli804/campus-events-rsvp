"use client";
// BROWSER CODE: a teaching panel that shows what our own fetch() calls
// recorded: method, path, status, and response JSON.
// It deliberately leaves out headers and request bodies (no credentials,
// no names or emails).
export default function RequestInspector({ entries, emptyMessage = "No API requests yet." }) {
  return (
    <section className="panel inspector" aria-labelledby="inspector-heading">
      <h2 id="inspector-heading">Request Inspector</h2>
      <p className="hint">
        Teaching aid: this panel shows what the frontend code recorded about its own requests (newest first).
        To see the actual network request, open DevTools → <strong>Network</strong> → <strong>Fetch/XHR</strong>.
      </p>

      {entries.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ol className="inspector-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <p className="inspector-line">
                <span className="method">{entry.method}</span> {entry.path} →{" "}
                <span className={entry.status < 400 ? "status-ok" : "status-error"}>{entry.status}</span>
              </p>
              <pre tabIndex={0} aria-label={`Response JSON for ${entry.method} ${entry.path}`}>
                {JSON.stringify(entry.body, null, 2)}
              </pre>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
