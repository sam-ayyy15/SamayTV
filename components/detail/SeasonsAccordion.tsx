"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { tmdb, tmdbImage, type Season } from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";
import EpisodeRow from "@/components/detail/EpisodeRow";

export default function SeasonsAccordion({
  tvId,
  seasons,
  onWatchEpisode,
}: {
  tvId: number;
  seasons: Season[];
  onWatchEpisode: (seasonNumber: number, episodeNumber: number) => void;
}) {
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const realSeasons = seasons.filter((s) => s.season_number > 0);

  if (realSeasons.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Browse</p>
        <h2 className="section-title font-sans text-base font-semibold uppercase tracking-[0.08em] text-white">Seasons</h2>
      </div>
      <div className="space-y-2">
        {realSeasons.map((season) => (
          <SeasonRow
            key={season.id}
            tvId={tvId}
            season={season}
            isOpen={openSeason === season.season_number}
            onToggle={() =>
              setOpenSeason((cur) =>
                cur === season.season_number ? null : season.season_number,
              )
            }
            onWatchEpisode={onWatchEpisode}
          />
        ))}
      </div>
    </section>
  );
}

function SeasonRow({
  tvId,
  season,
  isOpen,
  onToggle,
  onWatchEpisode,
}: {
  tvId: number;
  season: Season;
  isOpen: boolean;
  onToggle: () => void;
  onWatchEpisode: (seasonNumber: number, episodeNumber: number) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["season", tvId, season.season_number],
    queryFn: () => tmdb.tvSeason(tvId, season.season_number),
    enabled: isOpen,
  });

  const poster = tmdbImage(season.poster_path, "w185");

  return (
    <div
      className="overflow-hidden rounded-xl border border-hairline bg-bg-elevated transition-all duration-200 hover:border-white/15"
      style={{ background: isOpen ? "rgba(255,255,255,0.03)" : undefined }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors duration-200 hover:bg-white/3"
        aria-expanded={isOpen}
      >
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-bg shadow-md">
          {poster && <Image src={poster} alt={season.name} fill className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{season.name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {season.episode_count} Episodes
            {season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ""}
          </p>
        </div>
        {season.vote_average ? <RatingRing value={season.vote_average} size={30} /> : null}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="ml-1 shrink-0 text-text-secondary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-hairline">
              {season.overview && (
                <p className="px-4 py-3 text-sm leading-relaxed text-text-secondary">{season.overview}</p>
              )}
              {isLoading && (
                <div className="space-y-2 px-4 py-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="shimmer h-14 rounded-lg" />
                  ))}
                </div>
              )}
              {data?.episodes.map((ep) => (
                <EpisodeRow key={ep.id} episode={ep} onWatch={onWatchEpisode} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
