"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { tmdbImage, type MediaType, type TmdbListItem } from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";

interface Top10RailProps {
  items: TmdbListItem[];
  defaultMediaType?: MediaType;
}

export default function Top10Rail({
  items,
  defaultMediaType = "tv",
}: Top10RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const top10 = items.slice(0, 10);

  if (top10.length === 0) return null;

  return (
    <section className="relative py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-5 flex items-end justify-between"
      >
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Trending
          </p>
          <h2
            className="ghost-text text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-none"
            aria-label="Top 10 Today"
          >
            TOP 10
          </h2>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scrollerRef.current?.scrollBy({ left: -480, behavior: "smooth" })}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollerRef.current?.scrollBy({ left: 480, behavior: "smooth" })}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </motion.div>

      <div
        ref={scrollerRef}
        className="no-scrollbar snap-x-rail flex gap-1 overflow-x-auto pb-2 pl-2"
      >
        {top10.map((item, i) => {
          const mediaType = item.media_type ?? defaultMediaType;
          const title = item.title ?? item.name ?? "";
          const src = tmdbImage(item.poster_path, "w500");

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/${mediaType}/${item.id}`}
                className="group flex shrink-0 items-end"
              >
                {/* Ghost rank number */}
                <span
                  className="ghost-text -mr-5 select-none text-[clamp(80px,12vw,120px)] font-extrabold leading-none transition-all duration-300 group-hover:opacity-60"
                  style={{ zIndex: 1 }}
                  aria-hidden
                >
                  {i + 1}
                </span>

                {/* Poster */}
                <div
                  className="relative w-[140px] shrink-0 overflow-hidden rounded-xl bg-bg-elevated transition-all duration-400"
                  style={{
                    zIndex: 2,
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
                    {src ? (
                      <Image
                        src={src}
                        alt={title}
                        fill
                        sizes="140px"
                        className="object-cover transition-all duration-500 group-hover:scale-[1.06] group-hover:brightness-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-bg-elevated text-center text-xs text-text-secondary">
                        {title}
                      </div>
                    )}

                    {/* Hover play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-250 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                        <svg viewBox="0 0 24 24" fill="black" className="h-4 w-4 translate-x-0.5">
                          <path d="M6 4.5v15l13-7.5-13-7.5z" />
                        </svg>
                      </div>
                    </div>

                    <RatingRing value={item.vote_average} size={32} className="absolute left-2 top-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
