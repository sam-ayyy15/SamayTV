"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  pickLogo,
  tmdbImage,
  type MediaType,
  type MovieDetail,
  type TvDetail,
} from "@/lib/tmdb";
import ProviderStrip from "@/components/detail/ProviderStrip";

interface DetailHeaderProps {
  mediaType: MediaType;
  detail: MovieDetail | TvDetail;
  onWatch: (season?: number, episode?: number) => void;
}

function formatRuntime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${mins} min (${h}h ${m}m)` : `${mins} min`;
}

function formatReleaseDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) + " (United States)"
    );
  } catch {
    return dateStr;
  }
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function DetailHeader({ mediaType, detail, onWatch }: DetailHeaderProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const title =
    mediaType === "movie" ? (detail as MovieDetail).title : (detail as TvDetail).name;
  const logo = pickLogo(detail.images?.logos);
  const genres = detail.genres ?? [];
  const region = detail["watch/providers"]?.results?.US;
  const productions = detail.production_companies ?? [];

  let creatorLabel = "Director";
  let creators: { id: number; name: string; profile_path: string | null }[] = [];

  if (mediaType === "tv") {
    const tv = detail as TvDetail;
    creators = tv.created_by ?? [];
    creatorLabel = "Creator";
  } else {
    const movie = detail as MovieDetail;
    creators = (movie.credits?.crew ?? [])
      .filter((c) => c.job === "Director")
      .map((c) => ({ id: c.id, name: c.name, profile_path: c.profile_path }));
  }

  let dateStr = "";
  let runtimeStr = "";
  let subCountStr = "";

  if (mediaType === "movie") {
    const movie = detail as MovieDetail;
    if (movie.release_date) dateStr = formatReleaseDate(movie.release_date);
    if (movie.runtime) runtimeStr = formatRuntime(movie.runtime);
  } else {
    const tv = detail as TvDetail;
    if (tv.first_air_date) dateStr = formatReleaseDate(tv.first_air_date);
    subCountStr = [
      tv.number_of_seasons
        ? `${tv.number_of_seasons} Season${tv.number_of_seasons !== 1 ? "s" : ""}`
        : null,
      tv.number_of_episodes ? `${tv.number_of_episodes} Episodes` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const companyLogos = productions.filter((c) => c.logo_path).slice(0, 3);
  const companyNames = productions.filter((c) => !c.logo_path).slice(0, 3);

  function toggleSaved(key: string) {
    setSaved((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="pb-4 pt-8 md:pt-10">
      {/* Title logo or text */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mb-5"
      >
        {logo ? (
          <Image
            src={logo}
            alt={title}
            width={400}
            height={120}
            priority
            className="h-auto max-h-[90px] w-auto max-w-[320px] object-contain drop-shadow-2xl"
          />
        ) : (
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-xl md:text-4xl">
            {title}
          </h1>
        )}
      </motion.div>

      {/* Production companies */}
      {(companyLogos.length > 0 || companyNames.length > 0) && (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mb-5 flex flex-wrap items-center gap-4"
        >
          {companyLogos.map((c) => {
            const logoUrl = tmdbImage(c.logo_path, "w185");
            return logoUrl ? (
              <div
                key={c.id}
                className="relative h-5 w-16 opacity-55 invert"
                title={c.name}
              >
                <Image
                  src={logoUrl}
                  alt={c.name}
                  fill
                  className="object-contain object-left"
                  sizes="64px"
                />
              </div>
            ) : null;
          })}
          {companyNames.map((c) => (
            <span
              key={c.id}
              className="text-xs font-bold uppercase tracking-widest text-white/40"
            >
              {c.name}
            </span>
          ))}
        </motion.div>
      )}

      {/* Date + runtime + episode count */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        className="mb-4 flex flex-col gap-1.5"
      >
        {dateStr && (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-3.5 w-3.5 shrink-0 text-white/38"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
            </svg>
            {dateStr}
          </span>
        )}
        {runtimeStr && (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-3.5 w-3.5 shrink-0 text-white/38"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {runtimeStr}
          </span>
        )}
        {subCountStr && (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-3.5 w-3.5 shrink-0 text-white/38"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 3H8" strokeLinecap="round" />
            </svg>
            {subCountStr}
          </span>
        )}
      </motion.div>

      {/* Genre pills */}
      {genres.length > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mb-5 flex flex-wrap gap-2"
        >
          {genres.map((g) => (
            <span
              key={g.id}
              className="rounded-full border border-white/14 bg-white/5 px-3.5 py-1 text-xs font-medium
                text-white/65 transition-all duration-200 hover:border-white/25 hover:text-white/90"
            >
              {g.name}
            </span>
          ))}
        </motion.div>
      )}

      {/* Director / Creator */}
      {creators.length > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.33, ease: "easeOut" }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          {creators.slice(0, 2).map((c) => {
            const avatar = tmdbImage(c.profile_path, "w185");
            return (
              <div key={c.id} className="flex items-center gap-2.5">
                <div
                  className="relative h-9 w-9 overflow-hidden rounded-full bg-white/8 ring-1 ring-white/14"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/55">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white/85">{c.name}</p>
                  <p className="text-[11px] text-white/38">{creatorLabel}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* CTA buttons */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.36, ease: "easeOut" }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <motion.button
          onClick={() =>
            onWatch(
              mediaType === "tv" ? 1 : undefined,
              mediaType === "tv" ? 1 : undefined,
            )
          }
          className="flex items-center gap-2.5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold
            text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{ boxShadow: "0 2px 20px rgba(255,255,255,0.18)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-px">
            <path d="M6 4.5v15l13-7.5-13-7.5z" />
          </svg>
          Watch
        </motion.button>

      </motion.div>

      {/* Streaming providers */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="mb-7"
      >
        <ProviderStrip region={region} />
      </motion.div>

      {/* User star rating */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.44, ease: "easeOut" }}
        className="mb-5"
      >
        <p className="mb-2.5 text-sm text-white/50">What did you think of {title}?</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setUserRating(star === userRating ? 0 : star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
              className="transition-transform duration-100 hover:scale-110 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill={star <= (hoverRating || userRating) ? "#f5c518" : "none"}
                stroke="#f5c518"
                strokeWidth={1.5}
                className="h-5 w-5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Action pills: Favorite / Watchlist / Share */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.48, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-2"
      >
        {(
          [
            {
              key: "favorite",
              label: "Favorite",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill={saved.favorite ? "white" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191
                      1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447
                      2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
            {
              key: "watchlist",
              label: "Watchlist",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
            {
              key: "share",
              label: "Share",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-3.5 w-3.5"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
                </svg>
              ),
            },
          ] as const
        ).map(({ key, label, icon }) => (
          <motion.button
            key={key}
            onClick={() => toggleSaved(key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium
              transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
              ${
                saved[key]
                  ? "border-white/40 bg-white/12 text-white"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/26 hover:text-white/85"
              }`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            {icon}
            {label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
