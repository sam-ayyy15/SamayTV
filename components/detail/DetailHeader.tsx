"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  pickLogo,
  tmdbImage,
  type MediaType,
  type MovieDetail,
  type TvDetail,
} from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";
import Pill from "@/components/ui/Pill";
import CastList from "@/components/detail/CastList";
import ProviderStrip from "@/components/detail/ProviderStrip";

interface DetailHeaderProps {
  mediaType: MediaType;
  detail: MovieDetail | TvDetail;
  onWatch: (seasonNumber?: number, episodeNumber?: number) => void;
}

const baseTransition = { duration: 0.55, ease: "easeOut" as const };

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: baseTransition,
};

export default function DetailHeader({ mediaType, detail, onWatch }: DetailHeaderProps) {
  const title = mediaType === "movie" ? (detail as MovieDetail).title : (detail as TvDetail).name;
  const poster = tmdbImage(detail.poster_path, "w500");
  const logo = pickLogo(detail.images?.logos);
  const genres = detail.genres ?? [];
  const cast = detail.credits?.cast ?? [];
  const region = detail["watch/providers"]?.results?.US;

  let dateRange = "";
  let countLine = "";
  let networkName: string | null = null;
  let networkLogo: string | null = null;
  let creators: { id: number; name: string; profile_path: string | null }[] = [];

  if (mediaType === "tv") {
    const tv = detail as TvDetail;
    dateRange = tv.last_air_date
      ? `${tv.first_air_date?.slice(0, 4)} – ${tv.last_air_date.slice(0, 4)}`
      : `${tv.first_air_date?.slice(0, 4)} – Present`;
    countLine = `${tv.number_of_seasons} Season${tv.number_of_seasons !== 1 ? "s" : ""} · ${tv.number_of_episodes} Episodes`;
    networkName = tv.networks?.[0]?.name ?? null;
    networkLogo = tmdbImage(tv.networks?.[0]?.logo_path, "w185");
    creators = tv.created_by ?? [];
  } else {
    const movie = detail as MovieDetail;
    dateRange = movie.release_date?.slice(0, 4) ?? "";
    countLine = movie.runtime ? `${movie.runtime} min` : "";
    const directors = (movie.credits?.crew ?? []).filter((c) => c.job === "Director");
    creators = directors.map((d) => ({ id: d.id, name: d.name, profile_path: d.profile_path }));
  }

  return (
    <div className="relative grid gap-8 px-[clamp(20px,4vw,56px)] pt-10 md:grid-cols-[200px_1fr_260px] lg:grid-cols-[220px_1fr_280px]">
      {/* Left: Poster */}
      <motion.div {...fadeUp} transition={{ ...baseTransition, delay: 0.1 }} className="relative mx-auto w-full max-w-[220px] md:mx-0">
        <div
          className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-bg-elevated"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6)" }}
        >
          {poster && (
            <Image src={poster} alt={title} fill className="object-cover" />
          )}
          <RatingRing value={detail.vote_average} size={46} className="absolute left-2.5 top-2.5" />
          <div
            className="absolute inset-x-0 bottom-0 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white/90"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)", backdropFilter: "blur(4px)" }}
          >
            Most Viewed
          </div>
        </div>
      </motion.div>

      {/* Center: Metadata */}
      <motion.div {...fadeUp} transition={{ ...baseTransition, delay: 0.2 }} className="min-w-0">
        {logo ? (
          <Image
            src={logo}
            alt={title}
            width={380}
            height={110}
            className="mb-5 h-auto max-w-[320px] object-contain drop-shadow-xl"
          />
        ) : (
          <h1 className="mb-5 font-display text-4xl font-bold leading-tight text-white">{title}</h1>
        )}

        {/* Meta row */}
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
          {networkLogo && (
            <div className="relative h-5 w-10 opacity-70">
              <Image src={networkLogo} alt={networkName ?? ""} fill className="object-contain" />
            </div>
          )}
          {networkName && !networkLogo && (
            <span className="font-medium text-text-secondary">{networkName}</span>
          )}
          {dateRange && (
            <span className="flex items-center gap-1.5">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5 shrink-0">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
              </svg>
              {dateRange}
            </span>
          )}
          {countLine && (
            <span className="flex items-center gap-1.5">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5 shrink-0">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 3H8" strokeLinecap="round" />
              </svg>
              {countLine}
            </span>
          )}
        </div>

        {/* Genre pills */}
        {genres.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {genres.map((g) => (
              <Pill key={g.id}>{g.name}</Pill>
            ))}
          </div>
        )}

        {/* Creators */}
        {creators.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {creators.map((c) => {
              const avatar = tmdbImage(c.profile_path, "w185");
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="relative h-7 w-7 overflow-hidden rounded-full bg-bg-elevated ring-1 ring-white/10">
                    {avatar && (
                      <Image src={avatar} alt={c.name} fill className="object-cover" />
                    )}
                  </div>
                  <span className="text-sm text-text-secondary">{c.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onWatch(mediaType === "tv" ? 1 : undefined, mediaType === "tv" ? 1 : undefined)}
            className="btn-glow flex items-center gap-2.5 rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-black transition-all duration-250 hover:bg-accent-hover hover:scale-[1.03] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6 4.5v15l13-7.5-13-7.5z" />
            </svg>
            Watch
          </button>
          <a
            href={`/api/vyla/extras?kind=downloads&type=${mediaType}&id=${detail.id}`}
            className="flex items-center gap-2 rounded-full border border-hairline-strong bg-white/5 px-7 py-2.5 text-sm font-medium text-white transition-all duration-250 hover:bg-white/10 hover:border-white/30 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Download
          </a>
        </div>

        <ProviderStrip region={region} />
      </motion.div>

      {/* Right: Cast */}
      <motion.div {...fadeUp} transition={{ ...baseTransition, delay: 0.3 }}>
        <CastList cast={cast} />
      </motion.div>
    </div>
  );
}
