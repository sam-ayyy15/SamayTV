import Link from "next/link";
import { tmdbServer } from "@/lib/tmdb-server";
import { pickTrailer, tmdbImage } from "@/lib/tmdb";
import DetailClient from "@/components/detail/DetailClient";

export const revalidate = 300;

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return <DetailError message="Invalid movie ID." />;
  }

  let detail;
  try {
    detail = await tmdbServer.movieDetail(id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[MovieDetailPage] fetch failed:", message);
    return <DetailError message={message} />;
  }

  const backdrop = tmdbImage(detail.backdrop_path, "original");
  const trailer = pickTrailer(detail.videos?.results);

  return (
    <main>
      <DetailClient
        mediaType="movie"
        detail={detail}
        backdrop={backdrop}
        trailer={trailer}
      />
    </main>
  );
}

function DetailError({ message }: { message: string }) {
  const isNotFound = message.includes("404") || message.includes("not found");
  const isRateLimit = message.includes("429") || message.includes("rate limit");
  const isMissingKey = message.includes("TMDB_API_KEY");

  const heading = isNotFound
    ? "Movie not found"
    : isRateLimit
    ? "Too many requests"
    : isMissingKey
    ? "Configuration error"
    : "Something went wrong";

  const body = isNotFound
    ? "This movie doesn't exist or has been removed from the catalogue."
    : isRateLimit
    ? "We've hit TMDB's rate limit. Please try again in a moment."
    : isMissingKey
    ? "The TMDB API key is not configured on this server."
    : "We couldn't load this movie right now. Please try again.";

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-7 w-7 text-white/40"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{heading}</p>
        <p className="mt-1.5 max-w-sm text-sm text-white/50">{body}</p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-80"
      >
        Back to home
      </Link>
    </main>
  );
}
