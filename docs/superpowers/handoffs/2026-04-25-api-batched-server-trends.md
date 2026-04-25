# Handoff prompt — for Claude Code in `sl-servers-parent`

> 이 파일은 API 레포(`/Users/horyu/git/github/sl-servers-parent`)에서 작업하는 Claude Code 세션에 그대로 붙여넣을 프롬프트입니다.

## Status: ✅ Implemented in `sl-servers-parent` commit `e8111ea` (2026-04-25)

Live shape (verified by reading `ServerAPI.kt`, `ServerTrendsResponse.kt`, `ServerTrendsWindow.kt`, `ServerTrendsResolution.kt`):

```kotlin
data class ServerTrendsResponse(
    val window: String,                       // "6h" | "24h" | "7d"
    val resolution: String,                   // "15m" | "1h" | "6h"
    val bucketCount: Int,
    val endTime: Instant,
    val serverIds: List<String>,              // EXTRA — not in the original request, but useful
    val trends: Map<String, List<Int?>>,      // serverId -> oldest..newest player counts; nulls allowed
)
```

`Cache-Control: public, max-age=60` is set exactly as requested. `400 BAD_REQUEST` on invalid `window` / `resolution`. The `serverIds=` query-string filter was NOT implemented — frontend will always receive all online servers (acceptable; size ~100KB). The Plan B `useTrends` hook should consume this shape directly.

---

## Prompt

You are picking up a task that originated in the frontend repo (`sl-servers-frontend`). I'm not going to code this myself — your job is to design the endpoint, raise any concerns about the proposal, and (after I approve) implement it.

### Why we need this

The frontend is going through a major redesign. The new server-list page renders a **virtualized list** of all servers with an **inline 24h player-count sparkline per row**. With ~1,000+ servers, calling the existing `GET /api/servers/{serverId}/graph` once per row is obviously not viable — we need a single batched endpoint that returns recent player-count history for *all* servers (or a filtered subset) in one request.

### What already exists (do not break)

- `POST /api/servers` — returns the full server list with summary fields. Untouched.
- `GET /api/servers/{serverId}/graph?startTime&stopTime&aggregateEvery` — per-server time-series, used by the server detail page. **Keep as-is**, the detail page still uses it.
- `InfluxDbService.serverTrend(...)` — the underlying data source for the per-server graph. The new endpoint should query the same measurement(s) but in a single grouped query, not N separate queries.

### What we want — proposed shape

```
GET /api/servers/trends
  ?window=24h         # optional, default 24h, allowed: 6h | 24h | 7d
  &resolution=1h      # optional, default 1h, allowed: 15m | 1h | 6h
  &serverIds=         # optional, comma-separated. omit = all servers
```

Response (compact — sparkline only needs the y-values, not timestamps):

```json
{
  "window": "24h",
  "resolution": "1h",
  "bucketCount": 24,
  "endTime": "2026-04-25T12:00:00Z",
  "trends": {
    "12345": [0, 0, 1, 3, 5, 7, 12, 18, 22, 25, 28, 27, 24, 22, 19, 17, 14, 11, 9, 6, 4, 2, 1, 0],
    "67890": [30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    "...": [...]
  }
}
```

Notes on the shape:
- `trends` keyed by `serverId` (string for JSON portability), value = ordered array of player counts, oldest → newest. Length = `bucketCount`.
- Servers that are too new to have full history: return whatever buckets exist, **left-padded with `null`** (so position-relative-to-end is preserved). Frontend draws `null` as "no data" and shows a "new" badge.
- Servers offline at a bucket time: `0` is fine (they had 0 players); use `null` only when the server didn't exist yet.
- Do **not** include offline servers in the trends map at all if they're not in the current `/api/servers` response — the frontend only needs trends for servers it's already showing.

### Constraints

- **Latency budget**: this is called every time the list is loaded. Target: P99 < 500ms even with all servers (~1,000+) included. Use a single Flux query that groups by `serverId`, do not loop in Kotlin.
- **Cache**: the data updates every minute on the InfluxDB side. Set `Cache-Control: public, max-age=60` (or whatever your existing list cadence is). Frontend will revalidate every 5 min.
- **Payload**: 1,000 servers × 24 ints × ~4 bytes = ~100KB raw. Acceptable. Don't try to compress in-app — let HTTP gzip handle it. If it ever grows past 250KB, revisit (e.g., delta encoding or binary format), but not now.
- **Auth / rate limiting**: same as `POST /api/servers`. No new auth surface.

### Open questions for you to think about (raise these BEFORE coding)

1. Does `InfluxDbService` already support a single grouped-by-server query, or will you need to add one? If the latter, what does the Flux look like?
2. Is there any server that should be excluded from the response (private, hidden, banned)? Mirror whatever `POST /api/servers` filters out.
3. Should the response include the bucket *timestamps* explicitly, or is `endTime + resolution + index` enough? (Frontend currently doesn't need them, but adding them now is cheap if you think we'll regret omitting.)

### What I want from you, in order

1. Read `ServerService.getServerGraph` and `InfluxDbService.serverTrend` and confirm this can be done with one Flux query.
2. Reply with: (a) any pushback on the proposed shape, (b) answers to the 3 open questions above, (c) a 1-paragraph implementation sketch (which files you'll touch, query you'll write).
3. **Wait for my approval** before writing code. Don't surprise me.
4. After approval: implement, add an OpenAPI/Swagger annotation matching `ServerAPI` style, add a basic test that asserts response shape and bucket count for a sample server.

### Frontend integration plan (FYI, you don't have to act on this)

The frontend will:
- Call `POST /api/servers` and `GET /api/servers/trends` in parallel on initial load.
- Render the list immediately when `/servers` resolves; sparklines fade in when `/trends` resolves.
- Refresh `/trends` every 5 minutes; refresh `/servers` every 1 minute (existing cadence).

---

End of prompt.
