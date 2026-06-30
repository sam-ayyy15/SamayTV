# CLAUDE.md

Guidance for building **Vyla Stream** — a dark, cinematic, black-and-white web platform for
browsing movies & TV shows, reading rich info, and streaming them in the browser.

This file is the source of truth for the project. Read it fully before writing code, and
keep it updated as decisions change.

> **Visual reference.** The look, layout, and feature set are modeled on the supplied
> "1Shows" reference screenshots (see `/docs/reference/`). When a design decision is
> ambiguous, match those screenshots. The summary in §10 is the authority for tokens and
> components; the screenshots are the authority for overall feel.

---

## 1. What we are building

A single web app where a user can:

1. **Browse** a cinematic home page: a full-bleed featured **hero**, a **Top 10 Today** rail with giant ghosted rank numbers, and rails like **On The Air**, Trending, Popular — all poster cards carrying a circular **rating ring**.
2. **Search** for any title from a centered search bar (with a `/` keyboard hint).
3. **Open a rich detail page**: left poster (with a "Most Viewed" badge) + circular rating ring; center column with the **title logo art**, network + production companies, air-date range, season/episode counts, genre pills, creators/directors, and **Watch** / **Download** buttons; an **"Available on"** provider-logo strip; a right-hand **Casts & Credits** column; an **Overview**; an embedded **trailer**; and a **seasons accordion** listing episodes with ratings and synopses.
4. **Press Watch** and stream the title in an in-browser HLS player, with subtitle tracks and a source switcher.
5. Grab **direct download links** via the Download button.

Aesthetic target: the **1Shows reference layout** rendered in a strict **black-and-white**
palette — true-black background, white text and controls, grayscale UI, cinematic full-bleed
artwork (the only color on screen comes from the artwork itself). TMDB-style score rings,
rounded pill controls, generous spacing, subtle motion. Content-forward; chrome stays quiet.

The top nav has exactly two sections: **Movies** and **TV**.

---

## 2. The single most important architectural fact

**Two APIs, joined by the TMDB ID.**

| Concern | Source of truth |
|---|---|
| Discovery, search, posters, backdrops, synopsis, cast, genres, season/episode lists, ratings | **TMDB API** |
| Playable HLS/MP4 sources, subtitle tracks, download links, provider health | **Vyla API** |

Vyla is a streaming resolver, **not** a metadata API. Its `meta` event only returns
`id`, `title`, `release_date`, `runtime`, `vote_average`, and it can be `null` entirely.
**Never build the browse or detail UI from Vyla data.** Use TMDB for everything the user
reads/sees, and call Vyla only when the user presses Play (and for the downloads tab).

Both systems speak **TMDB IDs**, so the flow is always:
`TMDB browse/detail → get tmdb_id → hand tmdb_id to Vyla to stream`.

---

## 3. Tech stack (use this unless told otherwise)

- **Next.js (App Router) + TypeScript** — we need server-side route handlers to keep secrets off the client.
- **Tailwind CSS** for styling, with a small custom design-token layer (see §10).
- **hls.js** for HLS playback (native fallback on Safari).
- **TanStack Query** for TMDB data fetching/caching on the client.
- No heavy UI kit. Build the small set of components we need by hand to keep the Apple TV look precise.

Why Next.js specifically: Vyla's API key must **never** ship to the browser, and TMDB's key
shouldn't either. Next.js route handlers act as our thin backend/proxy (see §4–§5).

---

## 4. Architecture

```
Browser (React UI, hls.js)
   │
   │  fetch our own /api/* routes only — never Vyla/TMDB directly
   ▼
Next.js Route Handlers  (server-only secrets live here)
   ├── /api/tmdb/*      → proxies TMDB, injects TMDB_API_KEY
   ├── /api/vyla/token  → mints a 30-min Vyla session token from VYLA_API_KEY
   ├── /api/vyla/stream → opens Vyla SSE (/movie or /tv) and pipes it to the client
   └── /api/vyla/extras → subtitles + downloads passthrough
   │
   ▼
TMDB API            Vyla API (https://missourimonster-vyla-v3.hf.space)
```

The client talks **only** to our own `/api/*` routes. This hides keys, sidesteps tier rules,
and gives us one place to handle errors, caching, and rate-limit backoff.

---

## 5. Security & secrets (non-negotiable)

- `VYLA_API_KEY` and `TMDB_API_KEY` are **server-only**. Never expose them, never put them in `NEXT_PUBLIC_*`, never log them.
- The browser authenticates to Vyla with a **short-lived session token** (`X-Session-Token`), minted server-side via `POST /api/auth`. Tokens expire after **30 minutes** — re-mint on demand and on auth failure.
- Streaming requires a **standard/partner** key or a session token. The **public key cannot stream** (returns 403). For local dev without a real key, the public key `public_api_key` only works for `/api/health`, `/api/subtitles`, `/api/downloads`.
- Treat the streamed source URLs as ephemeral; don't persist them.

`.env.local` (do not commit):

```
TMDB_API_KEY=...               # v3 API key or v4 read token
VYLA_API_KEY=...               # standard/partner tier for streaming
VYLA_BASE_URL=https://missourimonster-vyla-v3.hf.space
```

---

## 6. Vyla API reference (condensed — full doc in /docs/vyla_api_doc.md)

Base URL: `https://missourimonster-vyla-v3.hf.space`

### Auth — mint a session token (server-side)
`POST /api/auth` with `Authorization: Bearer <VYLA_API_KEY>` → `{ token }`, valid 30 min.
Client then sends `X-Session-Token: <token>` on streaming requests.

### Stream a movie
`GET /movie?id=<tmdbId>` — SSE stream. Optional `sources=vidlink,vixsrc` to pick providers.

### Stream a TV episode
`GET /tv?id=<tmdbSeriesId>&season=<n>&episode=<n>` — SSE stream.
`id` is the **series** TMDB ID, not an episode ID. Season/episode are 1-based.

### SSE event shape (both endpoints)
Events are newline-delimited `data: {json}` lines. Three types, in order:

- `meta` — fires first. `{ type:"meta", meta:{id,title,release_date,runtime,vote_average}|null, subtitles:[...] }`. **Subtitles arrive here, before any source.**
- `source` — one per working provider as it verifies. `{ type:"source", source:{ source, label, url } }`. `url` is a fully-qualified, CORS-safe, proxy-routed HLS/MP4 URL — pass it straight to hls.js or `video.src`, no rewriting.
- `done` — fires last. `{ type:"done", total:<count> }`. `total: 0` means no playable sources.

### Data models
- **Source**: `{ source:string (provider key), label:string (display name), url:string }`
- **Subtitle**: `{ label:string, file:string (.vtt/.srt URL), type:"vtt"|"srt", source:string }`
- **Download**: `{ url:string, quality:"1080p"|"720p"|..., size:string|null, format:"MP4"|"MKV" }`

### Utility endpoints (public key OK)
- `GET /api/subtitles/movie/:id` · `GET /api/subtitles/tv/:id/:s/:e`
- `GET /api/downloads/movie/:id` · `GET /api/downloads/tv/:id/:s/:e`
- `GET /api/health` → `{ status:"ok"|"degraded", sources:{ key:{ok,ms} } }`

### Status codes
`200` stream opened · `400` missing param · `401` bad/no auth · `403` tier too low (public used for streaming) · `429` rate limited · `500` server error before stream. **No 502** — failed providers just mean zero `source` events then `done` with `total:0`.

### Rate limits
Per key, not per IP. standard = 100/60s, partner = 1000/60s, public = 10/60s.
**Session-token requests are NOT rate limited** — another reason the client uses tokens, not the key. On `429`: response has `resetAt` (ms epoch), `limit`, `window`; back off until `resetAt`.

### Caching
5-min in-memory cache server-side; repeat requests return near-instantly.

---

## 7. TMDB integration (everything the user reads/sees)

Proxy all of this through `/api/tmdb/*`. The reference UI is data-hungry — fetch these:

**Home rails**
- Featured hero: `/trending/all/day` (top item) — use its backdrop + **logo** for the hero.
- Top 10 Today: `/trending/tv/day` and `/trending/movie/day` (or `/all/day`), take first 10.
- On The Air: `/tv/on_the_air`. Also `/movie/popular`, `/tv/popular`, `/movie/top_rated`, `/discover/movie?with_genres=`.
- Genres: `/genre/movie/list`, `/genre/tv/list` (map IDs → genre pills).

**Search**
- `/search/multi?query=` (returns mixed movie/tv with `media_type`).

**Movie detail** — `append_to_response` in one call:
`/movie/{id}?append_to_response=credits,images,videos,watch/providers,release_dates`

**TV detail**:
`/tv/{id}?append_to_response=credits,images,videos,watch/providers,content_ratings`
then `/tv/{id}/season/{n}` for each season's episode list (for the accordion).

**Fields the reference UI maps to** (don't skip these — they're visible in the screenshots):
- **Title logo art** → `images.logos` (pick an English `.svg`/`.png`; build URL with `original`). The hero and detail titles render this image, **not** plain text. Fall back to styled text if no logo exists.
- **Rating ring** → `vote_average` (0–10). Render as a circular progress ring; color by value (see §10).
- **Network + production companies** → `networks[0]` (logo), `production_companies[].name`.
- **Air-date range** → `first_air_date` → `last_air_date` (TV) or `release_date` (movie).
- **Counts** → `number_of_seasons`, `number_of_episodes`.
- **Genre pills** → `genres[].name`.
- **Creators / directors** → TV `created_by[]`; movie directors from `credits.crew` where `job === "Director"`. Show small avatars (`profile_path`).
- **Cast column** → `credits.cast[]` (name, `character`, `profile_path`); "Show All" expands the list.
- **Overview** → `overview`.
- **Trailer** → `videos.results` where `type === "Trailer"` and `site === "YouTube"`; embed the YouTube player. Show a play overlay over the thumbnail.
- **"Available on" strip** → `watch/providers` (`results.<region>.flatrate/buy/rent`), render provider logos. These are **informational links to where it's officially available** — they are NOT the in-app stream. The white **Watch** button is what calls Vyla.
- **Seasons accordion** → `seasons[]` (name, `episode_count`, `air_date`, `vote_average`, `overview`, `poster_path`); expand to list episodes from the season endpoint.

**Images** — `https://image.tmdb.org/t/p/<size>/<path>`: posters `w500`/`w780`, backdrops `w1280`/`original`, logos `w300`/`original`, profiles `w185`. Always null-check paths and show a graceful placeholder (the reference never shows a broken image).

Map TMDB `media_type` (`movie` | `tv`) into routing so the Watch button hits the right Vyla endpoint.

---

## 8. Streaming flow on the client (the core interaction)

When the user presses **Watch** on a detail page (and for TV, picks a season+episode):

1. Client calls our `/api/vyla/token` to get a fresh session token (cache it client-side, refresh near 30 min or on 401).
2. Client opens our `/api/vyla/stream?type=movie&id=...` (or `type=tv&id=&season=&episode=`). That handler opens the Vyla SSE upstream with the token and **streams it back unmodified** to the browser.
3. Client parses SSE incrementally (read the body reader, split on `\n`, JSON-parse each `data: ` line). See the working pattern in `/docs/vyla_api_doc.md` §11.
4. On `meta`: set the title and **add subtitle `<track>` elements** to the `<video>`.
5. On the **first** `source`: start playback immediately — do **not** wait for `done`. Push every subsequent source into a **fallback queue**.
6. On hls.js fatal error: transparently advance to the next source in the queue (auto-failover). Surface a manual source/quality switcher too.
7. On `done`: if no source ever arrived (`total:0`), show a clean "Not available to stream" state.

### HLS playback rule
- HLS (`.m3u8`): use `hls.js` (`hls.loadSource(url); hls.attachMedia(video)`), start on `MANIFEST_PARSED`. On Safari where `Hls.isSupported()` is false, set `video.src = url` (native HLS).
- MP4: set `video.src = url` directly.
- The Vyla `url` is already proxied/CORS-safe — never modify it.

---

## 9. Routes / pages

### `/` — Home
- **Top segmented nav** (sticky): logo mark + centered search bar + **Movies / TV** pill nav + profile avatar.
- **Hero**: full-bleed backdrop of the featured title with a left-bottom gradient. Overlaid: the title **logo art**, a meta-pill row (rating ring/star, "N Seasons", primary genre), a 3-line truncated synopsis, and two controls — a round white **Play** button + a **See More** pill. Bottom-right: a thumbnail **featured carousel** (active item has a white border) that swaps the hero.
- **Top 10 Today** rail: large ghosted outline "TOP 10" heading + poster cards each with a rating ring, and **giant translucent rank numbers (1–10)** sitting behind/beside the posters. Snap-scroll with ‹ › arrows.
- **On The Air** rail (and Trending / Popular / Top Rated rails): section title + "View all" link + snap-scroll poster cards with rating rings.

### `/search`
- Centered search; results as a poster grid (cards carry rating rings + title + year).

### `/movie/[id]` and `/tv/[id]` — Detail
Three-region layout over a faded backdrop:
- **Left**: poster card with the rating ring (top-left) and a "Most Viewed on …" badge banner across the bottom.
- **Center**: title **logo art**; network logo + production-company names; calendar icon + air-date range; TV/episode-count line; genre pills; creators/directors with avatars; white **Watch** and **Download** pill buttons; an **"Available on"** provider-logo strip.
- **Right**: **Casts & Credits** column (avatar + name + character), with a white **Show All** toggle.
Below the fold: **Overview** paragraph → embedded **Trailer** (YouTube) with side arrows → **Seasons accordion** ("… Collection"): each season row shows thumbnail, name, episode count, rating, air date, description, and expands to its episode list. Each episode has its own Watch action → opens the player for that `season`/`episode`.

### Player
Render as an **immersive overlay/modal** over the detail page (preferred), or a `/watch/[type]/[id]` route. Custom minimal controls, subtitle menu, source switcher (see §8, §10).

---

## 10. Design system — 1Shows layout, black & white palette

The look is the point. Strict **black-and-white**: true-black background, white text and
controls, grayscale chrome. The only color on screen comes from the **artwork** itself. The
layout, components, and motion follow the 1Shows reference screenshots in `/docs/reference/`;
only the palette is monochrome.

### Color
```
--bg:            #000000   /* app background — true black */
--bg-elevated:   #0e0e0e   /* cards, sheets, accordion rows */
--bg-nav:        rgba(10,10,10,0.7)   /* translucent sticky nav, backdrop-blur */
--text-primary:  #ffffff   /* headings, primary text */
--text-secondary:#9a9a9a   /* metadata, characters, captions (neutral gray) */
--accent:        #ffffff   /* PRIMARY: filled buttons are white with black text */
--accent-on:     #000000   /* text/icons on white buttons */
--accent-hover:  #e6e6e6   /* white button hover */
--hairline:      rgba(255,255,255,0.10)
--surface-hover: rgba(255,255,255,0.06)
/* rating-ring scale — keep these few colors; they read as data, not decoration.
   If you want pure monochrome rings, use --text-primary for the stroke instead. */
--score-high:    #ffffff   /* >= 7.0  (or keep green #21d07a if you want score color) */
--score-mid:     #9a9a9a   /* 4.0–6.9 */
--score-low:     #4d4d4d   /* < 4.0   */
--score-track:   rgba(255,255,255,0.14)
```
**White is the primary action color.** Watch / Download / Play / See More are **solid white
pills with black text/icons**; secondary actions are outlined (white hairline border, transparent
fill, white text). The logo mark is a white-on-black (or black-on-white) glyph next to the
wordmark. No blues, no navy — grayscale only, color comes from posters and backdrops.

> **Rating rings:** default to monochrome (white stroke on a faint track). If you prefer the
> TMDB-style score coloring, the green/yellow values above are the *only* sanctioned exception —
> pick one approach and apply it consistently.

### Typography
- Font: `Inter` (or SF Pro / -apple-system) → system-ui fallback. Clean, slightly condensed feel.
- Section headers like **TOP 10** use a large outlined/ghosted treatment (transparent fill, thin white stroke) — see Top10Rail below.
- Titles on hero/detail are **TMDB logo images**, not text (fall back to bold white text if absent).
- Metadata rows are small (~13–15px), `--text-secondary`, rendered as **rounded pills** ("3 Seasons", "Sci-Fi & Fantasy") or icon + text groups.
- Synopsis line-height ~1.6, max-width ~70ch.

### Layout & spacing
- Page side padding ~`clamp(20px, 4vw, 56px)`.
- **Sticky translucent nav** (`--bg-nav` + `backdrop-blur`): logo left, **centered search bar**, segmented **Movies / TV** pill nav (active = filled white pill with black text), profile avatar right.
- **Snap-scroll rails** (`scroll-snap-type: x mandatory`, hidden scrollbars, peeking next card), each with a title and ‹ › arrow controls.
- Posters: `2:3`, rounded `12–14px`, subtle shadow; lift + brighten on hover/focus.
- Hero & detail backdrops bleed edge-to-edge under a bottom/left gradient (`linear-gradient(to top, var(--bg) 0%, transparent 65%)`) so text sits on black.

### Motion
- Transitions `~250–400ms`, ease `cubic-bezier(0.32, 0.72, 0, 1)`.
- Cards scale ~1.04 + soft white glow on hover/focus; rating rings animate their stroke on mount.
- Player and detail overlays fade + scale from ~0.96. Respect `prefers-reduced-motion`.

### Signature components (build these to spec)
- **RatingRing** — circular SVG progress ring around `vote_average`; monochrome white stroke (or the score scale if chosen); number centered. Appears on every poster card and the detail poster. This is the most-repeated motif — get it right.
- **Top10Rail** — horizontal rail where each poster is paired with a **giant translucent outlined rank number** (1–10) behind/beside it; big ghosted "TOP 10 / SHOWS TODAY" heading.
- **PillNav** — segmented **Movies / TV** control; active tab is a filled white pill with black text.
- **SearchBar** — centered, rounded, with a leading magnifier, `Type / to search` placeholder, a `/` keyboard shortcut to focus, and a trailing filter icon.
- **Hero** — backdrop + logo art + meta pills + truncated synopsis + round white Play button + See More pill + bottom-right featured thumbnail carousel (active item has a white border).
- **DetailHeader** — left poster (RatingRing + "Most Viewed" badge) · center meta + white Watch/Download pills + "Available on" provider strip · right CastList.
- **CastList** — avatar + name + character rows, with a white **Show All** toggle.
- **TrailerEmbed** — YouTube trailer with play overlay and side arrows.
- **SeasonsAccordion** — expandable season rows (thumbnail, name, episode count, RatingRing/score, air date, overview) → episode list with per-episode Watch.
- **PosterCard**, **PosterRail**, **ProviderStrip**, **Player** (custom controls + subtitle menu + source switcher), **SkeletonShimmer**.

### General rules
- Default to **black & white**; no color theme, no light theme, unless asked.
- Few borders — use `--hairline`, elevation, and white-on-black contrast instead of boxes.
- Custom video controls (thin scrubber, **white** fill, glassy translucent bar) — avoid raw browser controls in the main player.
- Focus-driven, keyboard-navigable rails with visible white focus rings.

---

## 11. Suggested file structure

```
app/
  layout.tsx
  page.tsx                      # home
  search/page.tsx
  movie/[id]/page.tsx
  tv/[id]/page.tsx
  api/
    tmdb/[...path]/route.ts     # TMDB proxy (injects key)
    vyla/token/route.ts         # mint session token
    vyla/stream/route.ts        # SSE passthrough for /movie and /tv
    vyla/extras/route.ts        # subtitles + downloads
components/
  nav/        PillNav.tsx  SearchBar.tsx  TopNav.tsx
  cards/      PosterCard.tsx  RatingRing.tsx  PosterRail.tsx  Top10Rail.tsx
  home/       Hero.tsx  FeaturedCarousel.tsx
  detail/     DetailHeader.tsx  CastList.tsx  ProviderStrip.tsx
              TrailerEmbed.tsx  SeasonsAccordion.tsx  EpisodeRow.tsx
  player/     Player.tsx  SourceSwitcher.tsx  SubtitleMenu.tsx
  ui/         Pill.tsx  SkeletonShimmer.tsx  Badge.tsx
lib/
  tmdb.ts          # typed TMDB client (calls our proxy) + image URL helpers
  vyla.ts          # token mgmt + SSE parser + types
  hls-player.ts    # hls.js setup, failover, subtitle wiring
  score.ts         # vote_average → ring color/percent
  design tokens in app/globals.css + tailwind.config
docs/
  vyla_api_doc.md      # the full API reference
  reference/           # the 1Shows reference screenshots (design source of truth)
.env.local
```

---

## 12. Commands

```
npm run dev      # local dev (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

Add a quick smoke check: hit `/api/health` to confirm provider status before debugging
playback issues — a `degraded` status explains missing sources.

---

## 13. Key implementation notes (learned from the API)

1. **Start playback on the first `source` event** — never wait for `done`.
2. **Build a fallback queue** from later sources; auto-advance on fatal hls.js errors.
3. **Subtitles come in the `meta` event** — wire them up before the first source.
4. **Re-mint the session token on 401** and proactively near the 30-min mark.
5. **Public key can't stream** (403) — only session token or standard/partner.
6. **`total:0` is normal**, not an error — show "Not available", not a crash.
7. **Don't modify Vyla `url`s** — they're already proxied and CORS-safe.
8. **Honor `429`** using `resetAt`; prefer session tokens (unmetered) for client streaming.
9. **Never trust Vyla metadata for UI** — TMDB owns the info experience.
10. **Check `/api/health`** when sources go missing during dev.

---

## 14. Coding conventions

- TypeScript strict mode. Define explicit types for `Source`, `Subtitle`, `Download`, and the SSE `meta`/`source`/`done` events in `lib/vyla.ts`.
- Keep all third-party calls behind `/api/*`; the client imports only `lib/tmdb.ts` and `lib/vyla.ts`.
- Handle every loading/empty/error state with the skeleton + graceful-placeholder pattern — Apple TV never shows a broken image or a raw error.
- Accessibility: keyboard-navigable rails, focus rings, captions on by default-available, `prefers-reduced-motion` respected.

---

## 15. Responsible use

Vyla aggregates third-party streaming providers. Whoever deploys this is responsible for
ensuring their use complies with applicable law and the terms of the content sources and the
Vyla API. Keep API keys private and rate-limit-friendly. This note should stay in the repo.
