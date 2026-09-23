# Topic and post loading

Home and Explore share `topicsResource`. Each topic page has its own resource
for the latest 20 posts. The resources reuse fresh data for 30 seconds and share
in-flight requests, including React StrictMode's development remounts. Stale
data stays visible while a revisit, window focus, or reconnect refreshes it.
There is no continuous polling. Retry buttons recover from failed requests.

Successful topic/post mutations update visible cached data and invalidate the
affected resources. Active views refresh immediately; inactive views refresh on
their next visit. Deletion through the dashboard also invalidates topic data.
Only public topic data is cached; private dashboard responses are not cached.
The cache lasts for the browser session and a full page reload clears it.

The topics endpoint counts posts in one SQL query without loading their content.
The dashboard eagerly joins topic names instead of querying each topic separately.
Topic post reads remain limited to 20 and use ID as a tie-breaker for timestamps.

## Verification

- From `frontend`: `node --experimental-strip-types --test tests/resource.test.mjs`
- From the repository root: `backend/venv/Scripts/python.exe -m unittest discover -s backend/tests`
- From `frontend`: `npm.cmd run build`

The backend tests use an isolated SQLite database and make no AI calls. In a
browser's Network panel, opening Home and then Explore within 30 seconds should
produce one topics GET total. Revisiting a topic within that window should reuse
its posts. Creating/deleting a post should refresh its count, score, and summary.

Post creation/deletion still waits for the existing AI analysis. This change
optimizes data loading; moving AI processing to a durable background job would
be a separate change to when scores and summaries become available.
