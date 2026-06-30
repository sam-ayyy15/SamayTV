"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tmdbImage, type MediaType, type TmdbListItem } from "@/lib/tmdb";

interface HeroProps {
  items: TmdbListItem[];
  logos: Record<number, string | null>;
}

export default function Hero({ items, logos }: HeroProps) {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const featured = items.slice(0, 5);
  const item = featured[active];

  useEffect(() => {
    if (!autoplay || featured.length < 2) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % featured.length), 7000);
    return () => clearTimeout(t);
  }, [active, autoplay, featured.length]);

  if (!item) return null;

  const mediaType: MediaType = item.media_type ?? "movie";
  const title = item.title ?? item.name ?? "";
  const backdrop = tmdbImage(item.backdrop_path, "original");
  const logo = logos[item.id];
  const overview = (item as { overview?: string }).overview ?? "";

  const handleThumbClick = (i: number) => {
    setActive(i);
    setAutoplay(false);
  };

  return (
    <section className="relative h-[82vh] min-h-[520px] w-full overflow-hidden" aria-label="Featured content">
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {backdrop && (
            <Image
              src={backdrop}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover backdrop-image"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-gradient-left" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-16 px-[clamp(20px,4vw,56px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg"
          >
            {/* Logo or title */}
            {logo ? (
              <Image
                src={logo}
                alt={title}
                width={400}
                height={120}
                className="mb-5 h-auto w-full max-w-[300px] object-contain drop-shadow-2xl"
              />
            ) : (
              <h1 className="mb-5 font-display text-5xl font-bold leading-tight text-white drop-shadow-2xl">
                {title}
              </h1>
            )}

            {/* Meta pills */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-yellow-300">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {item.vote_average?.toFixed(1)}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
                {mediaType === "tv" ? "TV Series" : "Movie"}
              </span>
            </div>

            {/* Overview */}
            {overview && (
              <p className="mb-7 line-clamp-3 text-sm leading-relaxed text-text-secondary max-w-md">
                {overview}
              </p>
            )}

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/${mediaType}/${item.id}`}
                className="btn-glow flex items-center gap-2.5 rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-black transition-all duration-250 hover:bg-accent-hover hover:scale-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6 4.5v15l13-7.5-13-7.5z" />
                </svg>
                Watch Now
              </Link>
              <Link
                href={`/${mediaType}/${item.id}`}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-250 hover:bg-white/12 hover:border-white/35 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail carousel */}
      <div className="absolute bottom-6 right-[clamp(20px,4vw,56px)] z-10 flex gap-2">
        {featured.map((f, i) => {
          const thumb = tmdbImage(f.backdrop_path, "w300");
          const isActive = i === active;
          return (
            <button
              key={f.id}
              onClick={() => handleThumbClick(i)}
              aria-label={`Feature ${f.title ?? f.name}`}
              aria-pressed={isActive}
              className="group relative h-12 w-20 overflow-hidden rounded-lg transition-all duration-300"
              style={{
                border: isActive ? "2px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                boxShadow: isActive ? "0 0 16px rgba(255,255,255,0.3)" : "none",
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
            >
              {thumb ? (
                <Image src={thumb} alt="" fill className="object-cover transition-all duration-300 group-hover:brightness-110" />
              ) : (
                <div className="h-full w-full bg-bg-elevated" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar for autoplay */}
      {autoplay && (
        <div className="absolute bottom-0 left-0 right-0 z-10 h-0.5 bg-white/10">
          <motion.div
            key={active}
            className="h-full bg-white/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 7, ease: "linear" }}
          />
        </div>
      )}
    </section>
  );
}
