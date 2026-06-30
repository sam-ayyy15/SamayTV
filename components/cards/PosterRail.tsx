"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PosterCard from "@/components/cards/PosterCard";
import type { MediaType, TmdbListItem } from "@/lib/tmdb";

interface PosterRailProps {
  title: string;
  items: TmdbListItem[];
  defaultMediaType?: MediaType;
  viewAllHref?: string;
}

export default function PosterRail({
  title,
  items,
  defaultMediaType = "movie",
  viewAllHref,
}: PosterRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  /** Compute the neighbor-shift direction for a given card index */
  function shiftFor(i: number): -1 | 0 | 1 {
    if (hoveredIndex === null || i === hoveredIndex) return 0;
    if (i < hoveredIndex) return -1;
    return 1;
  }

  return (
    <section className="relative py-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 flex items-end justify-between"
      >
        <div>
          <h2
            className="section-title font-sans text-base font-semibold tracking-wide text-white uppercase"
            style={{ letterSpacing: "0.08em" }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-medium text-text-secondary transition-colors duration-200 hover:text-white"
            >
              View all →
            </Link>
          )}
          <div className="hidden gap-1.5 sm:flex">
            <button
              aria-label="Scroll left"
              onClick={() => scrollBy(-500)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollBy(500)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/*
        The scroller keeps overflow-x: auto for horizontal scrolling.
        The hover overlay is portaled to document.body (fixed-position),
        so it is never clipped by this overflow context.
      */}
      <div
        ref={scrollerRef}
        className="no-scrollbar snap-x-rail flex gap-3 overflow-x-auto pb-2"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <PosterCard
              id={item.id}
              mediaType={item.media_type ?? defaultMediaType}
              title={item.title ?? item.name ?? ""}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              overview={item.overview}
              year={(item.release_date || item.first_air_date)?.slice(0, 4)}
              neighborShift={shiftFor(i)}
              index={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
