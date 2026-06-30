import type {
  Genre,
  MovieDetail,
  TmdbListResponse,
  TvDetail,
} from "@/lib/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";

async function fetchServer<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");
  const isBearer = apiKey.startsWith("eyJ");

  const search = new URLSearchParams(params);
  if (!isBearer) search.set("api_key", apiKey);

  const res = await fetch(`${TMDB_BASE}/${path}?${search.toString()}`, {
    headers: isBearer ? { Authorization: `Bearer ${apiKey}` } : undefined,
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`TMDB request failed: ${path} (${res.status})`);
  return res.json();
}

export const tmdbServer = {
  trendingAllDay: () => fetchServer<TmdbListResponse>("trending/all/day"),
  trendingTvDay: () => fetchServer<TmdbListResponse>("trending/tv/day"),
  trendingMovieDay: () => fetchServer<TmdbListResponse>("trending/movie/day"),
  onTheAir: () => fetchServer<TmdbListResponse>("tv/on_the_air"),
  popularMovies: () => fetchServer<TmdbListResponse>("movie/popular"),
  popularTv: () => fetchServer<TmdbListResponse>("tv/popular"),
  topRatedMovies: () => fetchServer<TmdbListResponse>("movie/top_rated"),
  genresMovie: () => fetchServer<{ genres: Genre[] }>("genre/movie/list"),
  genresTv: () => fetchServer<{ genres: Genre[] }>("genre/tv/list"),
  movieImages: (id: number) =>
    fetchServer<{ logos: { file_path: string; iso_639_1: string | null }[] }>(
      `movie/${id}/images`,
    ),
  tvImages: (id: number) =>
    fetchServer<{ logos: { file_path: string; iso_639_1: string | null }[] }>(
      `tv/${id}/images`,
    ),
  movieDetail: (id: string | number) =>
    fetchServer<MovieDetail>(`movie/${id}`, {
      append_to_response: "credits,images,videos,watch/providers,release_dates",
    }),
  tvDetail: (id: string | number) =>
    fetchServer<TvDetail>(`tv/${id}`, {
      append_to_response: "credits,images,videos,watch/providers,content_ratings",
    }),
  tvSeason: (id: string | number, season: number) =>
    fetchServer<{ episodes: import("@/lib/tmdb").Episode[] }>(
      `tv/${id}/season/${season}`,
    ),
};
