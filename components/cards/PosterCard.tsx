"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { tmdbImage, type MediaType } from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";
import { cn } from "@/lib/utils";

interface PosterCardProps {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  className?: string;
  index?: number;
}

export default function PosterCard({
  id,
  mediaType,
  title,
  posterPath,
  voteAverage,
  className,
  index = 0,
}: PosterCardProps) {
  const src = tmdbImage(posterPath, "w500");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/${mediaType}/${id}`}
        className={cn(
          "group relative block w-[155px] shrink-0 cursor-pointer overflow-hidden rounded-xl bg-bg-card sm:w-[175px]",
          className,
        )}
        style={{ transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Poster image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
          {src ? (
            <Image
              src={src}
              alt={title}
              fill
              sizes="175px"
              className="object-cover transition-all duration-500 group-hover:scale-[1.06] group-hover:brightness-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-elevated px-2 text-center text-xs text-text-secondary">
              {title}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="black" className="h-4 w-4 translate-x-0.5">
                <path d="M6 4.5v15l13-7.5-13-7.5z" />
              </svg>
            </div>
          </div>

          {/* Rating ring */}
          <RatingRing
            value={voteAverage}
            size={34}
            className="absolute left-2 top-2 drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <div className="px-1.5 py-2">
          <p className="line-clamp-1 text-[12px] font-medium leading-tight text-white/90 transition-colors duration-200 group-hover:text-white">
            {title}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
