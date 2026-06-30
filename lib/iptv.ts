export interface IptvChannel {
  id: string;
  name: string;
  alt_names: string[];
  network: string;
  owners: string[];
  country: string;       // ISO 3166-1 alpha-2
  subdivision: string;
  city: string;
  broadcast_area: string[];
  languages: string[];   // ISO 639-3 codes
  categories: string[];  // category IDs
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string;
  logo: string;          // logo URL (usually Wikimedia)
  is_closed: boolean;
}

export interface IptvStream {
  channel: string;       // IptvChannel.id
  url: string;
  http_referrer: string;
  user_agent: string;
  status: string;        // "online" | "error" | "timeout" | ""
  width: number;
  height: number;
  bitrate: number;
  fps: number;
  checked_at: string;
}

export interface IptvCategory {
  id: string;
  name: string;
}

export interface IptvCountry {
  code: string;          // ISO 3166-1 alpha-2
  name: string;
  native_name: string;
  flag: string;          // emoji flag
  languages: string[];
  region: string;
}

async function iptvFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api/iptv/${path}`);
  if (!res.ok) throw new Error(`IPTV fetch failed: ${path} (${res.status})`);
  return res.json();
}

export const iptv = {
  channels: () => iptvFetch<IptvChannel[]>("channels.json"),
  streams: () => iptvFetch<IptvStream[]>("streams.json"),
  categories: () => iptvFetch<IptvCategory[]>("categories.json"),
  countries: () => iptvFetch<IptvCountry[]>("countries.json"),
};

/** Return streams whose channel is in the provided set */
export function streamsForChannel(
  streams: IptvStream[],
  channelId: string,
): IptvStream[] {
  return streams.filter(
    (s) => s.channel === channelId && s.url && s.status !== "error",
  );
}
