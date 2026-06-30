"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { MediaType, MovieDetail, TvDetail, Video } from "@/lib/tmdb";
import DetailHeader from "@/components/detail/DetailHeader";
import CastList from "@/components/detail/CastList";
import SeasonsAccordion from "@/components/detail/SeasonsAccordion";
import TrailerEmbed from "@/components/detail/TrailerEmbed";
import Player from "@/components/player/Player";
import RatingRing from "@/components/cards/RatingRing";
import { tmdbImage } from "@/lib/tmdb";

interface DetailClientProps {
  mediaType: MediaType;
  detail: MovieDetail | TvDetail;
  backdrop: string | null;
  trailer: Video | null;
}

export default function DetailClient({ mediaType, detail, backdrop, trailer }: DetailClientProps) {
  const [player, setPlayer] = useState<{ season?: number; episode?: number } | null>(null);
  const title = mediaType === "movie" ? (detail as MovieDetail).title : (detail as TvDetail).name;
  const cast = detail.credits?.cast ?? [];
  const poster = tmdbImage(detail.poster_path, "w500");

  function handleWatch(season?: number, episode?: number) {
    setPlayer({ season, episode });
  }

  return (
    <div className="relative min-h-screen">
      {/* ── Fixed cinematic backdrop ─────────────────────────── */}
      {backdrop && (
        <div className="fixed inset-0 -z-10" aria-hidden style={{ height: "100vh" }}>
          <Image
            src={backdrop}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ filter: "brightness(0.4) saturate(1.05)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        </div>
      )}
      <div className="fixed inset-0 -z-20 bg-black" aria-hidden />

      {/* ── Main 3-column grid ──────────────────────────────── */}
      <div
        className="relative z-10 mx-auto w-full items-start gap-x-6 px-4 pt-[76px]
          md:grid md:px-8 lg:px-12"
        style={{
          gridTemplateColumns: "minmax(0,200px) 1fr minmax(0,270px)",
          maxWidth: "1440px",
        }}
      >
        {/* ── LEFT: sticky poster ──────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="sticky top-[76px] hidden h-fit md:block"
        >
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "2/3",
              borderRadius: "20px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            {poster ? (
              <Image src={poster} alt={title} fill className="object-cover" sizes="220px" />
            ) : (
              <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
                {title}
              </div>
            )}
            <div className="absolute left-2.5 top-2.5">
              <RatingRing value={detail.vote_average} size={42} />
            </div>
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5
                text-[10px] font-semibold uppercase tracking-[0.13em] text-white/90"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 100%)",
                backdropFilter: "blur(6px)",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5 text-white/60">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Most Viewed on Samay TV
            </div>
          </div>
        </motion.aside>

        {/* ── CENTER: all content ──────────────────────────── */}
        <div className="min-w-0 col-span-2 md:col-span-1">
          <DetailHeader mediaType={mediaType} detail={detail} onWatch={handleWatch} />

          {/* Mobile poster + cast row */}
          <div className="mt-6 flex items-start gap-4 md:hidden">
            {poster && (
              <div
                className="relative h-[180px] w-[120px] shrink-0 overflow-hidden rounded-2xl"
                style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.7)" }}
              >
                <Image src={poster} alt={title} fill className="object-cover" sizes="120px" />
                <div className="absolute left-1.5 top-1.5">
                  <RatingRing value={detail.vote_average} size={34} />
                </div>
              </div>
            )}
            <div className="flex-1 pt-1">
              <CastList cast={cast} />
            </div>
          </div>

          {/* Overview */}
          {detail.overview && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
              className="mt-10 max-w-2xl"
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Synopsis
              </p>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/60">
                Overview
              </h2>
              <p className="text-sm leading-[1.9] text-white/55">{detail.overview}</p>
            </motion.section>
          )}

          {/* Trailer */}
          <div className="mt-10 max-w-3xl">
            <TrailerEmbed trailer={trailer} />
          </div>

          {/* Seasons (TV) */}
          {mediaType === "tv" && (
            <div className="mt-4 max-w-3xl">
              <SeasonsAccordion
                tvId={detail.id}
                seasons={(detail as TvDetail).seasons}
                onWatchEpisode={(s, e) => handleWatch(s, e)}
              />
            </div>
          )}

          <div className="h-24" />
        </div>

        {/* ── RIGHT: sticky cast sidebar ───────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="sticky top-[76px] hidden h-fit md:block"
        >
          <div
            className="rounded-[20px] p-5"
            style={{
              background: "rgba(12,12,16,0.72)",
              backdropFilter: "blur(28px) saturate(140%)",
              WebkitBackdropFilter: "blur(28px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <CastList cast={cast} />
          </div>
        </motion.aside>
      </div>

      {/* ── Player overlay ──────────────────────────────────── */}
      {player && (
        <Player
          type={mediaType}
          id={detail.id}
          season={player.season}
          episode={player.episode}
          title={title}
          onClose={() => setPlayer(null)}
        />
      )}
    </div>
  );
}
