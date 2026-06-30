import Image from "next/image";
import { tmdbImage, type Episode } from "@/lib/tmdb";
import RatingRing from "@/components/cards/RatingRing";

export default function EpisodeRow({
  episode,
  onWatch,
}: {
  episode: Episode;
  onWatch: (seasonNumber: number, episodeNumber: number) => void;
}) {
  const still = tmdbImage(episode.still_path, "w300");

  return (
    <div className="group flex items-start gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-white/4 mx-2 mb-1">
      <div className="relative h-[68px] w-28 shrink-0 overflow-hidden rounded-lg bg-bg-elevated ring-1 ring-white/5">
        {still ? (
          <Image src={still} alt={episode.name} fill className="object-cover transition-all duration-300 group-hover:brightness-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-text-tertiary">
              <rect x="2" y="7" width="20" height="14" rx="2" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-semibold leading-snug text-white">
            <span className="mr-1.5 text-text-tertiary">{episode.episode_number}.</span>
            {episode.name}
          </p>
          <RatingRing value={episode.vote_average} size={28} className="shrink-0" />
        </div>
        {episode.overview && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">{episode.overview}</p>
        )}
      </div>
      <button
        onClick={() => onWatch(episode.season_number, episode.episode_number)}
        className="btn-glow shrink-0 self-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-accent-hover hover:scale-[1.04] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        Watch
      </button>
    </div>
  );
}
