"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Video } from "@/lib/tmdb";

export default function TrailerEmbed({ trailer }: { trailer: Video | null }) {
  const [playing, setPlaying] = useState(false);

  if (!trailer) return null;

  const thumb = `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`;
  const thumbFallback = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;

  return (
    <section className="py-8">
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Official</p>
        <h2 className="section-title font-sans text-base font-semibold uppercase tracking-[0.08em] text-white">Trailer</h2>
      </div>
      <div
        className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-bg-elevated"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
      >
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
            title={trailer.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Play trailer: ${trailer.name}`}
          >
            <img
              src={thumb}
              alt={trailer.name}
              className="h-full w-full object-cover transition-all duration-500 group-hover:brightness-75 group-hover:scale-[1.02]"
              onError={(e) => { (e.target as HTMLImageElement).src = thumbFallback; }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Play button */}
            <motion.span
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.span
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ boxShadow: "0 0 40px rgba(255,255,255,0.3), 0 8px 24px rgba(0,0,0,0.5)" }}
              >
                <svg viewBox="0 0 24 24" fill="black" className="h-6 w-6 translate-x-0.5">
                  <path d="M6 4.5v15l13-7.5-13-7.5z" />
                </svg>
              </motion.span>
              <span className="text-xs font-medium text-white/80 tracking-wide">Play Trailer</span>
            </motion.span>
          </button>
        )}
      </div>
    </section>
  );
}
