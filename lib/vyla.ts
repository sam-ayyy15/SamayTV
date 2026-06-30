export interface VylaMeta {
  id: number;
  title: string;
  release_date: string;
  runtime: number | null;
  vote_average: number;
}

export interface VylaSubtitle {
  label: string;
  file: string;
  type: "vtt" | "srt";
  source: string;
}

export interface VylaSource {
  source: string;
  label: string;
  url: string;
}

export interface VylaDownload {
  url: string;
  quality: string;
  size: string | null;
  format: "MP4" | "MKV";
}

export type VylaEvent =
  | { type: "meta"; meta: VylaMeta | null; subtitles: VylaSubtitle[] }
  | { type: "source"; source: VylaSource }
  | { type: "done"; total: number };

const TOKEN_KEY = "vyla_session_token";
const TOKEN_EXPIRY_KEY = "vyla_session_token_expiry";
const TOKEN_TTL_MS = 30 * 60 * 1000;
const REFRESH_MARGIN_MS = 60 * 1000;

export async function getSessionToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(TOKEN_KEY);
    const expiry = window.sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (cached && expiry && Date.now() < Number(expiry) - REFRESH_MARGIN_MS) {
      return cached;
    }
  }

  const res = await fetch("/api/vyla/token", { method: "POST" });
  if (!res.ok) throw new Error("Failed to mint Vyla session token");
  const { token } = await res.json();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(
      TOKEN_EXPIRY_KEY,
      String(Date.now() + TOKEN_TTL_MS),
    );
  }

  return token;
}

export interface StreamParams {
  type: "movie" | "tv";
  id: string | number;
  season?: number;
  episode?: number;
}

export async function* streamVyla(
  params: StreamParams,
  signal?: AbortSignal,
): AsyncGenerator<VylaEvent> {
  const search = new URLSearchParams({
    type: params.type,
    id: String(params.id),
  });
  if (params.type === "tv") {
    search.set("season", String(params.season));
    search.set("episode", String(params.episode));
  }

  let token = await getSessionToken();
  let res = await fetch(`/api/vyla/stream?${search.toString()}`, {
    headers: { "X-Session-Token": token },
    signal,
  });

  if (res.status === 401) {
    token = await getSessionToken(true);
    res = await fetch(`/api/vyla/stream?${search.toString()}`, {
      headers: { "X-Session-Token": token },
      signal,
    });
  }

  if (!res.ok || !res.body) {
    throw new Error(`Vyla stream failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as VylaEvent;
        yield event;
      } catch {
        // skip malformed line
      }
    }
  }
}
