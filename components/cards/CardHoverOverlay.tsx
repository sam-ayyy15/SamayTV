"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { tmdbImage, type MediaType } from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";

interface CardHoverOverlayProps {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  overview?: string;
  year?: string;
  cardRect: DOMRect | null;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CardHoverOverlay({
  id,
  mediaType,
  title,
  posterPath,
  voteAverage,
  overview,
  year,
  cardRect,
  visible,
  onMouseEnter,
  onMouseLeave,
}: CardHoverOverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !cardRect) return null;

  const src = tmdbImage(posterPath, "w500");

  // Expanded card is 1.5× the original card width
  const expandedW = cardRect.width * 1.5;
  // Center the expanded card over the original
  const rawLeft = cardRect.left - (expandedW - cardRect.width) / 2;
  // Clamp so it stays inside the viewport with 8px breathing room
  const clampedLeft = Math.max(
    8,
    Math.min(rawLeft, window.innerWidth - expandedW - 8)
  );

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Invisible full-screen catcher to close on stray mouse */}
          <div
            className="fixed inset-0 z-[9998]"
            style={{ pointerEvents: "none" }}
          />

          <motion.div
            key="hover-card"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            initial={{ scale: 0.88, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: -24 }}
            exit={{ scale: 0.88, opacity: 0, y: 8, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.9 }}
            style={{
              position: "fixed",
              top: cardRect.top,
              left: clampedLeft,
              width: expandedW,
              zIndex: 9999,
              transformOrigin: "top center",
              borderRadius: 14,
              overflow: "hidden",
              willChange: "transform, opacity",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)",
            }}
          >
            {/* ── Poster (same 2:3 ratio, untouched design) ────── */}
            <div className="relative" style={{ aspectRatio: "2/3" }}>
              {src ? (
                <Image
                  src={src}
                  alt={title}
                  fill
                  sizes="300px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-elevated px-3 text-center text-xs text-text-secondary">
                  {title}
                </div>
              )}

              {/* Top gradient for ring legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

              <RatingRing
                value={voteAverage}
                size={36}
                className="absolute left-2 top-2 drop-shadow-lg"
              />
            </div>

            {/* ── Info panel ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.08, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "rgba(12,12,14,0.97)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                padding: "12px 14px 14px",
              }}
            >
              {/* Title + year */}
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <p className="line-clamp-1 text-[13px] font-semibold text-white leading-tight">
                  {title}
                </p>
                {year && (
                  <span className="shrink-0 text-[10px] text-white/40">{year}</span>
                )}
              </div>

              {/* Overview */}
              {overview && (
                <p className="mb-3 line-clamp-3 text-[11px] leading-[1.55] text-white/60">
                  {overview}
                </p>
              )}

              {/* Action row */}
              <div className="flex gap-2">
                {/* Watch Now — primary */}
                <Link
                  href={`/${mediaType}/${id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white py-[7px] text-[12px] font-semibold text-black transition-colors hover:bg-white/88"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3 w-3 translate-x-[1px]"
                  >
                    <path d="M6 4.5v15l13-7.5-13-7.5z" />
                  </svg>
                  Watch
                </Link>

                {/* More info — secondary */}
                <Link
                  href={`/${mediaType}/${id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center rounded-full border border-white/20 bg-white/6 px-3.5 py-[7px] text-[12px] font-medium text-white/80 transition-colors hover:bg-white/12 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-3 w-3"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
