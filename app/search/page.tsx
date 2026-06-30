"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { tmdb } from "@/lib/tmdb";
import PosterCard from "@/components/cards/PosterCard";
import SkeletonShimmer from "@/components/ui/SkeletonShimmer";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => tmdb.search(query),
    enabled: query.trim().length > 0,
  });

  const results = (data?.results ?? []).filter(
    (r) => r.media_type === "movie" || r.media_type === "tv",
  );

  return (
    <main className="min-h-[80vh] px-[clamp(20px,4vw,56px)] py-12">
      {/* Search header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mb-10 max-w-xl"
      >
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
          Find anything
        </p>
        <form onSubmit={handleSubmit} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
            <svg className="h-4 w-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV shows…"
            className="w-full rounded-full border border-hairline-strong bg-white/5 py-3.5 pl-12 pr-5 text-sm font-medium text-white placeholder:text-text-secondary focus:border-white/30 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200"
            autoFocus
          />
        </form>
      </motion.div>

      {/* Results count */}
      {!isLoading && results.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-xs text-text-secondary"
        >
          {results.length} results for <span className="text-white font-medium">"{query}"</span>
        </motion.p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonShimmer key={i} className="aspect-[2/3] w-[155px] sm:w-[175px]" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && query.trim() && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center py-24 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-bg-elevated">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-text-secondary">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-base font-medium text-white">No results found</p>
          <p className="mt-1.5 text-sm text-text-secondary">Try a different title or keyword</p>
        </motion.div>
      )}

      {/* Initial empty state */}
      {!query.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center"
        >
          <p className="text-sm text-text-secondary">Start typing to search for movies & TV shows</p>
        </motion.div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {results.map((item, i) => (
            <PosterCard
              key={`${item.media_type}-${item.id}`}
              id={item.id}
              mediaType={item.media_type!}
              title={item.title ?? item.name ?? ""}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              overview={item.overview}
              year={(item.release_date || item.first_air_date)?.slice(0, 4)}
              index={i}
            />
          ))}
        </div>
      )}
    </main>
  );
}
