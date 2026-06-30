export type MediaType = "movie" | "tv";

export interface TmdbImageConfig {
  base: string;
}

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function tmdbImage(
  path: string | null | undefined,
  size: "w185" | "w300" | "w500" | "w780" | "w1280" | "original" = "original",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export interface TmdbListItem {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface TmdbListResponse<T = TmdbListItem> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface ImageAsset {
  file_path: string;
  iso_639_1: string | null;
}

export interface WatchProviderEntry {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderRegion {
  link?: string;
  flatrate?: WatchProviderEntry[];
  buy?: WatchProviderEntry[];
  rent?: WatchProviderEntry[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
  vote_average?: number;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface MovieDetail extends TmdbListItem {
  title: string;
  runtime: number | null;
  genres: Genre[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  images?: { logos: ImageAsset[]; backdrops: ImageAsset[] };
  videos?: { results: Video[] };
  reviews?: { results: Review[] };
  "watch/providers"?: { results: Record<string, WatchProviderRegion> };
}

export interface TvDetail extends TmdbListItem {
  name: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: Genre[];
  networks: { id: number; name: string; logo_path: string | null }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  seasons: Season[];
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  images?: { logos: ImageAsset[]; backdrops: ImageAsset[] };
  videos?: { results: Video[] };
  reviews?: { results: Review[] };
  "watch/providers"?: { results: Record<string, WatchProviderRegion> };
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const search = new URLSearchParams(params);
  const qs = search.toString();
  const res = await fetch(`/api/tmdb/${path}${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${path} (${res.status})`);
  }
  return res.json();
}

export const tmdb = {
  trendingAllDay: () => tmdbFetch<TmdbListResponse>("trending/all/day"),
  trendingTvDay: () => tmdbFetch<TmdbListResponse>("trending/tv/day"),
  trendingMovieDay: () => tmdbFetch<TmdbListResponse>("trending/movie/day"),
  onTheAir: () => tmdbFetch<TmdbListResponse>("tv/on_the_air"),
  popularMovies: () => tmdbFetch<TmdbListResponse>("movie/popular"),
  popularTv: () => tmdbFetch<TmdbListResponse>("tv/popular"),
  topRatedMovies: () => tmdbFetch<TmdbListResponse>("movie/top_rated"),
  genresMovie: () => tmdbFetch<{ genres: Genre[] }>("genre/movie/list"),
  genresTv: () => tmdbFetch<{ genres: Genre[] }>("genre/tv/list"),
  search: (query: string) =>
    tmdbFetch<TmdbListResponse>("search/multi", { query }),
  movieDetail: (id: string | number) =>
    tmdbFetch<MovieDetail>(`movie/${id}`, {
      append_to_response: "credits,images,videos,watch/providers,release_dates",
    }),
  tvDetail: (id: string | number) =>
    tmdbFetch<TvDetail>(`tv/${id}`, {
      append_to_response: "credits,images,videos,watch/providers,content_ratings",
    }),
  tvSeason: (id: string | number, season: number) =>
    tmdbFetch<{ episodes: Episode[] }>(`tv/${id}/season/${season}`),
};

export function pickLogo(logos: ImageAsset[] | undefined): string | null {
  if (!logos || logos.length === 0) return null;
  const english = logos.find((l) => l.iso_639_1 === "en");
  return tmdbImage((english ?? logos[0]).file_path, "original");
}

export function pickTrailer(videos: Video[] | undefined): Video | null {
  if (!videos) return null;
  return (
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ?? null
  );
}
