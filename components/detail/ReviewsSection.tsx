"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Review } from "@/lib/tmdb";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return "Just now";
}

function avatarSrc(avatarPath: string | null): string | null {
  if (!avatarPath) return null;
  // TMDB sometimes returns "/https://www.gravatar.com/..." with a leading slash
  if (avatarPath.startsWith("/https://") || avatarPath.startsWith("/http://")) {
    return avatarPath.slice(1);
  }
  return `https://image.tmdb.org/t/p/w185${avatarPath}`;
}

function StarRow({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  // TMDB rating is 0–10; convert to 0–5 for display
  const stars = rating / 2;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = stars >= s;
        const half = !filled && stars >= s - 0.5;
        return (
          <svg key={s} viewBox="0 0 24 24" className="h-3.5 w-3.5">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${s}`}>
                    <stop offset="50%" stopColor="#f5c518" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={`url(#half-${s})`}
                  stroke="#f5c518"
                  strokeWidth={1.5}
                />
              </>
            ) : (
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? "#f5c518" : "none"}
                stroke="#f5c518"
                strokeWidth={1.5}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isEdited =
    review.updated_at &&
    review.created_at &&
    new Date(review.updated_at).getTime() - new Date(review.created_at).getTime() > 60000;

  const avatar = avatarSrc(review.author_details.avatar_path);
  const displayName =
    review.author_details.name || review.author_details.username || review.author;

  // Split first line if it looks like a title (short + all caps or italic)
  const lines = review.content.trim().split(/\r?\n/);
  const hasTitle = lines.length > 1 && lines[0].length < 80;
  const titleLine = hasTitle ? lines[0] : null;
  const bodyText = hasTitle ? lines.slice(1).join("\n").trim() : review.content;

  const TRUNCATE_AT = 280;
  const isTruncatable = bodyText.length > TRUNCATE_AT;
  const displayText =
    !expanded && isTruncatable ? bodyText.slice(0, TRUNCATE_AT) + "…" : bodyText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(14,14,18,0.55)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/12">
            {avatar ? (
              <Image src={avatar} alt={displayName} fill className="object-cover" sizes="36px" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/50">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Name + date */}
          <div>
            <p className="text-[13px] font-semibold text-white/85">{displayName}</p>
            <p className="text-[11px] text-white/38">
              {relativeTime(review.created_at)}
              {isEdited && " (edited)"}
            </p>
          </div>
        </div>
        {/* Star rating */}
        <StarRow rating={review.author_details.rating} />
      </div>

      {/* Optional heading */}
      {titleLine && (
        <p className="mb-2 text-[13px] font-semibold italic text-white/70">{titleLine}</p>
      )}

      {/* Body */}
      <p className="whitespace-pre-line text-sm leading-relaxed text-white/58">{displayText}</p>

      {isTruncatable && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-medium text-white/45 transition-colors duration-150 hover:text-white/75"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </motion.div>
  );
}

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) return null;

  const visible = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="mt-10 max-w-3xl">
      <div className="mb-5 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white/70">
          Reviews
        </h2>
        <span className="text-xs text-white/35">({reviews.length})</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </AnimatePresence>
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-white/45
            transition-colors duration-150 hover:text-white/75"
        >
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </section>
  );
}
