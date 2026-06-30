"use client";

import Link from "next/link";

export default function MovieError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-white/40">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-white">Couldn&apos;t load this movie</p>
        <p className="mt-1.5 max-w-sm text-sm text-white/50">
          {error.message?.includes("fetch") ? "A network error occurred while fetching movie data." : error.message ?? "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full border border-white/20 px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-80">
          Back to home
        </Link>
      </div>
    </main>
  );
}
