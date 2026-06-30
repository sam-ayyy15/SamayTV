# 🎬 VYLA API - Comprehensive Documentation for Movie/TV Streaming Platform

## 📋 Complete API Reference Guide

I've compiled a complete, well-structured documentation for the Vyla API. This document includes all endpoints, authentication methods, data models, and code examples for your movie/TV streaming platform.

---

## **1. API OVERVIEW**

### **What is Vyla API?**
- **Type:** Node.js Streaming API (Hosted on Hugging Face Spaces)
- **Purpose:** Query multiple streaming providers simultaneously and stream HLS sources + subtitles in real-time
- **Protocol:** Server-Sent Events (SSE) for real-time streaming
- **Base URL:** `https://missourimonster-vyla-v3.hf.space`
- **Documentation URL:** https://vyla.mintlify.app/introduction

### **Key Features:**
1. **Multi-Provider Fanout** - Query all providers in parallel
2. **Real-Time SSE Streaming** - Results stream as they resolve (no waiting)
3. **Built-in HLS Proxy** - CORS-safe proxied streams
4. **Multi-Language Subtitles** - VTT and SRT formats
5. **Download Links** - Direct download URLs with quality labels
6. **Health Monitoring** - Real-time provider status checks

---

## **2. AUTHENTICATION METHODS**

### **Documentation Link:** https://vyla.mintlify.app/authentication

### **Method 1: Session Tokens (Browser/Client-Side Apps)**

**Use Case:** Browser players, client-side applications

**Flow:**
1. Your backend calls `POST /api/auth` with API key
2. Backend receives 30-minute session token
3. Token is sent to client
4. Client uses token in `X-Session-Token` header

**Step 1 - Get Token (Server-Side):**
```javascript
const response = await fetch('https://missourimonster-vyla-v3.hf.space/api/auth', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const { token } = await response.json();
// Token expires after 30 minutes - re-fetch when needed
```

**Step 2 - Use Token (Client-Side):**
```javascript
const response = await fetch('https://missourimonster-vyla-v3.hf.space/movie?id=550', {
  headers: { 
    'X-Session-Token': token
  }
});
```

### **Method 2: API Keys (Server-Side)**

**Use Case:** Server-side integrations, direct API access

**Key Tiers:**
| Tier | Rate Limit | Streaming | Streaming Endpoints |
|------|-----------|-----------|-------------------|
| public | 10 req/60s | ❌ No | `/api/health`, `/api/subtitles`, `/api/downloads` only |
| standard | 100 req/60s | ✅ Yes | All endpoints |
| partner | 1000 req/60s | ✅ Yes | All endpoints |

**Public Key for Testing:**
```
public_api_key
```

**Sending API Key:**
```bash
# Option 1: Authorization Header
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://missourimonster-vyla-v3.hf.space/api/health

# Option 2: X-API-Key Header
curl -H "X-API-Key: YOUR_API_KEY" \
  https://missourimonster-vyla-v3.hf.space/api/health
```

**Get Standard/Partner Keys:**
- Submit request at: https://vyla.mintlify.app/authentication (no public issuance)

---

## **3. STREAMING ENDPOINTS**

### **Endpoint 1: Stream Movie Sources**

**Documentation Link:** https://vyla.mintlify.app/api-reference/movie

**Endpoint:** `GET /movie?id=:id`

**Authentication:** Session token OR standard/partner API key (NOT public)

**Purpose:** Stream HLS sources, subtitles, and TMDB metadata for a movie

**Query Parameters:**
```
id (required)      - TMDB movie ID (number in URL)
                     Example: themoviedb.org/movie/550 → id=550
                     
sources (optional) - Comma-separated provider keys to query
                     Example: sources=vidlink,vixsrc
                     When omitted: all active providers queried
```

**cURL Example:**
```bash
curl -N "https://missourimonster-vyla-v3.hf.space/movie?id=550" \
  --header "Authorization: Bearer YOUR_API_KEY"
  
# Using Session Token:
curl -N "https://missourimonster-vyla-v3.hf.space/movie?id=550" \
  --header "X-Session-Token: YOUR_SESSION_TOKEN"
```

**JavaScript Example:**
```javascript
async function streamMovie(tmdbId, token) {
  const response = await fetch(
    `https://missourimonster-vyla-v3.hf.space/movie?id=${tmdbId}`,
    {
      headers: { 'X-Session-Token': token }
    }
  );
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const event = JSON.parse(line.slice(6));
      
      console.log('Event received:', event.type);
      // Handle 'meta', 'source', 'done' events
    }
  }
}
```

---

### **Endpoint 2: Stream TV Episode Sources**

**Documentation Link:** https://vyla.mintlify.app/api-reference/tv

**Endpoint:** `GET /tv?id=:id&season=:s&episode=:e`

**Authentication:** Session token OR standard/partner API key (NOT public)

**Purpose:** Stream HLS sources, subtitles, and TMDB metadata for a TV episode

**Query Parameters:**
```
id (required)      - TMDB series ID (NOT episode ID)
                     Example: themoviedb.org/tv/1396 → id=1396
                     
season (required)  - Season number (1-based, use 1 for first season)

episode (required) - Episode number within season (1-based)

sources (optional) - Comma-separated provider keys
                     Example: sources=vidlink,vixsrc
```

**cURL Example:**
```bash
# Breaking Bad S01E01
curl -N "https://missourimonster-vyla-v3.hf.space/tv?id=1396&season=1&episode=1" \
  --header "Authorization: Bearer YOUR_API_KEY"

# Using Session Token:
curl -N "https://missourimonster-vyla-v3.hf.space/tv?id=1396&season=1&episode=1" \
  --header "X-Session-Token: YOUR_SESSION_TOKEN"
```

**JavaScript Example:**
```javascript
async function streamTVEpisode(seriesId, season, episode, token) {
  const url = new URL('https://missourimonster-vyla-v3.hf.space/tv');
  url.searchParams.append('id', seriesId);
  url.searchParams.append('season', season);
  url.searchParams.append('episode', episode);
  
  const response = await fetch(url.toString(), {
    headers: { 'X-Session-Token': token }
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const event = JSON.parse(line.slice(6));
      // Process events: meta, source, done
    }
  }
}
```

---

## **4. SERVER-SENT EVENTS (SSE) STRUCTURE**

### **Event Types Breakdown**

Every `/movie` and `/tv` response contains three types of SSE events:

### **Event Type 1: META (Fires First)**

**When:** Immediately, before any provider resolves

**Contains:** TMDB metadata + all subtitle tracks

**Example:**
```json
{
  "type": "meta",
  "meta": {
    "id": 550,
    "title": "Fight Club",
    "release_date": "1999-10-15",
    "runtime": 139,
    "vote_average": 8.438
  },
  "subtitles": [
    {
      "label": "English",
      "file": "https://sub.vdrk.site/v1/vtt/movie/550/English.vtt",
      "type": "vtt",
      "source": "v1"
    },
    {
      "label": "Spanish",
      "file": "https://sub.vdrk.site/v1/vtt/movie/550/Spanish.vtt",
      "type": "vtt",
      "source": "v1"
    }
  ]
}
```

**Fields:**
- `type` (string) - Always "meta"
- `meta` (object/null) - TMDB metadata; null if TMDB_API_KEY not configured
- `subtitles` (array) - Subtitle[] objects (can be empty)

---

### **Event Type 2: SOURCE (One Per Working Provider)**

**When:** Each time a provider passes live verification

**Contains:** Streaming URL + provider info

**Example:**
```json
{
  "type": "source",
  "source": {
    "source": "vidlink",
    "label": "VidLink",
    "url": "https://missourimonster-vyla-v3.hf.space/api?url=https%3A%2F%2F...&vl=1"
  }
}
```

**Another Provider Example:**
```json
{
  "type": "source",
  "source": {
    "source": "meowtv",
    "label": "MeowTV",
    "url": "https://missourimonster-vyla-v3.hf.space/api?url=https%3A%2F%2F...&mt=1"
  }
}
```

**Fields:**
- `type` (string) - Always "source"
- `source` (object) - Source object with:
  - `source` (string) - Internal provider key
  - `label` (string) - Human-readable provider name
  - `url` (string) - Fully-qualified, CORS-safe HLS/MP4 URL

---

### **Event Type 3: DONE (Fires Last)**

**When:** All providers resolved or timed out

**Contains:** Total working source count

**Example:**
```json
{
  "type": "done",
  "total": 14
}
```

**Fields:**
- `type` (string) - Always "done"
- `total` (number) - Count of working source events emitted

---

### **Complete SSE Stream Example**

```
data: {"type":"meta","meta":{"id":550,"title":"Fight Club","release_date":"1999-10-15","runtime":139},"subtitles":[{"label":"English","file":"https://sub.vdrk.site/v1/vtt/movie/550/English.vtt","type":"vtt","source":"v1"}]}

data: {"type":"source","source":{"source":"vidlink","label":"VidLink","url":"https://missourimonster-vyla-v3.hf.space/api?url=https%3A%2F%2F...&vl=1"}}

data: {"type":"source","source":{"source":"meowtv","label":"MeowTV","url":"https://missourimonster-vyla-v3.hf.space/api?url=https%3A%2F%2F...&mt=1"}}

data: {"type":"done","total":2}
```

---

## **5. DATA MODELS**

### **Source Object**

**Returned in:** `source` events on `/movie` and `/tv`

```json
{
  "source": "provider-key",
  "label": "Provider Name",
  "url": "https://missourimonster-vyla-v3.hf.space/api?url=https%3A%2F%2F...&pp=1"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Internal provider key (matches `/api/health` keys) |
| `label` | string | Human-readable name for UI display |
| `url` | string | Fully-qualified, proxied, CORS-safe URL |

**URL Usage:**
- **For HLS streams:** Pass directly to `hls.loadSource(url)` - M3U8 paths are pre-rewritten
- **For MP4 streams:** Set directly as `video.src = url`
- **No preprocessing needed** - URL is complete and proxy-routed

---

### **Subtitle Object**

**Returned in:** `meta.subtitles` array and `/api/subtitles` endpoints

```json
{
  "label": "English",
  "file": "https://sub.vdrk.site/v1/vtt/movie/550/English.vtt",
  "type": "vtt",
  "source": "v1"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Language name (English, Spanish, Arabic, etc.) |
| `file` | string | Direct URL to WebVTT (.vtt) or SRT (.srt) file |
| `type` | string | Format: "vtt" or "srt" |
| `source` | string | Internal subtitle source identifier (informational) |

**Usage:**
```html
<!-- As HTML5 track element -->
<video id="player" controls>
  <track kind="subtitles" label="English" 
         src="https://sub.vdrk.site/v1/vtt/movie/550/English.vtt" />
  <track kind="subtitles" label="Spanish" 
         src="https://sub.vdrk.site/v1/vtt/movie/550/Spanish.vtt" />
</video>
```

---

### **Download Object**

**Returned in:** `/api/downloads` endpoints

```json
{
  "url": "https://...",
  "quality": "1080p",
  "size": "2.14 GB",
  "format": "MP4"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Direct download URL |
| `quality` | string | Quality label (1080p, 720p, 480p) or "Unknown" |
| `size` | string \| null | Human-readable size (e.g., "2.14 GB") or null |
| `format` | string | Container format (MP4, MKV) - uppercase |

---

## **6. UTILITY ENDPOINTS**

### **Endpoint 3: Get Movie Subtitles**

**Documentation Link:** https://vyla.mintlify.app/api-reference

**Endpoint:** `GET /api/subtitles/movie/:id`

**Authentication:** Any valid key or session token (public OK)

**Purpose:** Get subtitle tracks for a specific movie

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/subtitles/movie/550" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
[
  {
    "label": "English",
    "file": "https://sub.vdrk.site/v1/vtt/movie/550/English.vtt",
    "type": "vtt",
    "source": "v1"
  },
  {
    "label": "Spanish",
    "file": "https://sub.vdrk.site/v1/vtt/movie/550/Spanish.vtt",
    "type": "vtt",
    "source": "v1"
  }
]
```

---

### **Endpoint 4: Get TV Episode Subtitles**

**Endpoint:** `GET /api/subtitles/tv/:id/:season/:episode`

**Authentication:** Any valid key or session token (public OK)

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/subtitles/tv/1396/1/1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### **Endpoint 5: Get Movie Download Links**

**Endpoint:** `GET /api/downloads/movie/:id`

**Authentication:** Any valid key or session token (public OK)

**Purpose:** Get direct download URLs with quality levels

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/downloads/movie/550" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
[
  {
    "url": "https://example.com/fight-club-1080p.mp4",
    "quality": "1080p",
    "size": "2.14 GB",
    "format": "MP4"
  },
  {
    "url": "https://example.com/fight-club-720p.mp4",
    "quality": "720p",
    "size": "1.05 GB",
    "format": "MP4"
  }
]
```

---

### **Endpoint 6: Get TV Episode Download Links**

**Endpoint:** `GET /api/downloads/tv/:id/:season/:episode`

**Authentication:** Any valid key or session token (public OK)

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/downloads/tv/1396/1/1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### **Endpoint 7: Check Provider Health**

**Documentation Link:** https://vyla.mintlify.app/api-reference/quickstart

**Endpoint:** `GET /api/health`

**Authentication:** Any valid key or session token (public OK)

**Purpose:** Check real-time status of all providers

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/health" \
  -H "Authorization: Bearer public_api_key"
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "tmdb": true,
  "cache": 0,
  "probe_id": "155",
  "sources": {
    "vidlink": { 
      "ok": true, 
      "ms": 1204 
    },
    "meowtv": { 
      "ok": true, 
      "ms": 980 
    },
    "someprovider": { 
      "ok": false, 
      "ms": 435 
    }
  }
}
```

**Status Codes:**
- `ok` - All providers working
- `degraded` - At least one provider down, others working

---

### **Endpoint 8: Test Single Provider**

**Endpoint:** `GET /api/test/:id?source=:provider-key`

**Authentication:** Standard/partner key or session token (NOT public)

**Purpose:** Debug a specific provider in isolation

```bash
curl "https://missourimonster-vyla-v3.hf.space/api/test/550?source=vidlink" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Get Provider Keys from:**
```bash
# Check /api/health response for available source keys
curl "https://missourimonster-vyla-v3.hf.space/api/health" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## **7. HTTP STATUS CODES**

| Code | Meaning |
|------|---------|
| 200 | SSE stream opened successfully; events follow |
| 400 | Missing required parameter (id, season, episode) |
| 401 | Missing or invalid authentication |
| 403 | Key tier insufficient (public key used for streaming) |
| 429 | Rate limit exceeded |
| 500 | Server error before stream could begin |

**No 502 for Movies/TV:**
- If all providers fail, stream emits zero `source` events then `done` with `total: 0`
- Always check for at least one source before attempting playback

---

## **8. RATE LIMITING**

**Per API Key:** Tracked per key, not per IP

**Response Format (when limit exceeded):**
```json
{
  "error": "Rate limit exceeded",
  "resetAt": 1718000000000,
  "limit": 100,
  "window": 60000
}
```

**Key Details:**
- `resetAt` - Unix timestamp in milliseconds
- `limit` - Requests allowed in window
- `window` - Window duration in milliseconds

**Session Token Requests:** NOT rate limited (only direct API key usage counted)

---

## **9. CORS & HEADERS**

**All endpoints return:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Session-Token
Content-Type: application/json (or text/event-stream for SSE)
```

**Preflight (OPTIONS):** Returns `204 No Content` immediately

---

## **10. CACHING BEHAVIOR**

**TTL:** 5 minutes in-memory

**Per-Source Cache Key:** `source_key + tmdb_id + season + episode`

**Aggregate Cache Key:** `tmdb_id + season + episode + base`

**Benefits:**
- Cache hits skip provider fetch entirely
- Results returned near-instantly
- Cache resets on server restart

---

## **11. COMPLETE IMPLEMENTATION EXAMPLE**

### **Full Working Movie Player (Vanilla JS)**

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; }
    video { width: 100%; max-height: 600px; }
    #status { margin: 10px 0; padding: 10px; background: #f0f0f0; }
    #sources-list { margin: 20px 0; }
    .source-btn { padding: 8px 12px; margin: 5px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Vyla API Movie Streaming Demo</h1>
  
  <input type="number" id="tmdbId" placeholder="Enter TMDB ID" value="550">
  <button onclick="loadMovie()">Load Movie</button>
  
  <div id="status">Ready</div>
  <video id="player" controls></video>
  
  <div id="sources-list"></div>

  <script>
    const BASE_URL = 'https://missourimonster-vyla-v3.hf.space';
    const API_KEY = 'YOUR_API_KEY'; // Replace with your API key
    
    let hls;
    let sources = [];
    let started = false;

    // Get session token
    async function getSessionToken() {
      const response = await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const data = await response.json();
      return data.token;
    }

    // Play a specific source
    function playSource(url, label) {
      hls?.destroy();
      
      const statusDiv = document.getElementById('status');
      statusDiv.textContent = `Playing: ${label}`;

      if (!Hls.isSupported()) {
        document.getElementById('player').src = url;
        return;
      }

      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(document.getElementById('player'));

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        document.getElementById('player').play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          const nextSource = sources.find(s => s.url !== url);
          if (nextSource) {
            statusDiv.textContent = `Error. Trying: ${nextSource.label}`;
            playSource(nextSource.url, nextSource.label);
          } else {
            statusDiv.textContent = 'All sources failed.';
          }
        }
      });
    }

    // Main streaming function
    async function loadMovie() {
      const tmdbId = document.getElementById('tmdbId').value;
      const statusDiv = document.getElementById('status');
      
      if (!tmdbId) {
        statusDiv.textContent = 'Enter TMDB ID';
        return;
      }

      statusDiv.textContent = 'Getting session token...';
      const token = await getSessionToken();
      
      statusDiv.textContent = 'Connecting to Vyla API...';
      const response = await fetch(`${BASE_URL}/movie?id=${tmdbId}`, {
        headers: { 'X-Session-Token': token }
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      sources = [];
      started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6));

          if (event.type === 'meta') {
            statusDiv.textContent = `Loading: ${event.meta?.title || 'Unknown'}`;
            
            // Add subtitles
            event.subtitles?.forEach((sub, i) => {
              const track = document.createElement('track');
              track.kind = 'subtitles';
              track.label = sub.label;
              track.src = sub.file;
              track.default = i === 0;
              document.getElementById('player').appendChild(track);
            });
          }

          if (event.type === 'source') {
            sources.push(event.source);
            const sourcesList = document.getElementById('sources-list');
            
            if (!started) {
              started = true;
              playSource(event.source.url, event.source.label);
            }
            
            // Add source button for manual switching
            const btn = document.createElement('button');
            btn.className = 'source-btn';
            btn.textContent = `${event.source.label} (${event.source.source})`;
            btn.onclick = () => playSource(event.source.url, event.source.label);
            sourcesList.appendChild(btn);
          }

          if (event.type === 'done') {
            if (!started) {
              statusDiv.textContent = `No sources available (checked ${event.total})`;
            } else {
              statusDiv.textContent = `Complete: ${event.total} sources available`;
            }
          }
        }
      }
    }
  </script>
</body>
</html>
```

---

## **12. COMPLETE ENDPOINT TABLE**

| Endpoint | Method | Auth | Rate Limit | Returns | Link |
|----------|--------|------|-----------|---------|------|
| `/api/auth` | POST | API key (any tier) | Yes | 30-min token | https://vyla.mintlify.app/authentication |
| `/movie?id=:id` | GET | Session/Standard/Partner | Yes | SSE stream | https://vyla.mintlify.app/api-reference/movie |
| `/tv?id=:id&season=:s&episode=:e` | GET | Session/Standard/Partner | Yes | SSE stream | https://vyla.mintlify.app/api-reference/tv |
| `/api/subtitles/movie/:id` | GET | Any key | Yes | JSON array | https://vyla.mintlify.app/api-reference |
| `/api/subtitles/tv/:id/:s/:e` | GET | Any key | Yes | JSON array | https://vyla.mintlify.app/api-reference |
| `/api/downloads/movie/:id` | GET | Any key | Yes | JSON array | https://vyla.mintlify.app/api-reference |
| `/api/downloads/tv/:id/:s/:e` | GET | Any key | Yes | JSON array | https://vyla.mintlify.app/api-reference |
| `/api/health` | GET | Any key | Yes | Health JSON | https://vyla.mintlify.app/api-reference/quickstart |
| `/api/test/:id?source=:key` | GET | Session/Standard/Partner | Yes | SSE stream | https://vyla.mintlify.app/api-reference/quickstart |

---

## **13. IMPORTANT LINKS FOR YOUR PLATFORM**

📚 **Main Documentation:** https://vyla.mintlify.app/introduction

🎬 **API Reference:** https://vyla.mintlify.app/api-reference

🔐 **Authentication Guide:** https://vyla.mintlify.app/authentication

⚡ **Quickstart Guide:** https://vyla.mintlify.app/api-reference/quickstart

🎥 **Try Live Player:** https://vyla.mintlify.app/player

🏥 **Check Provider Health:** https://missourimonster-vyla-v3.hf.space/api/health

---

## **14. KEY DEVELOPMENT NOTES**

1. **Always start playback on FIRST source** - Don't wait for all providers
2. **Build fallback queue** - Store subsequent sources to switch on errors
3. **Handle 30-min token expiry** - Re-fetch token when request fails
4. **Check /api/health before deploying** - Verify providers are live
5. **CORS is handled** - Proxy rewrites all cross-origin issues
6. **Cache hits skip fetches** - Results within 5 minutes return instantly
7. **No public key for streaming** - Only session tokens or standard/partner keys
8. **Add subtitles from meta event** - They arrive before any source
9. **Use HLS.js for HLS streams** - MP4 sources use native video.src
10. **Monitor provider status** - Status can be "ok" or "degraded"

---

This documentation is complete and ready for your Claude Code implementation. All endpoints, authentication methods, data models, and code examples are included with direct links for reference!