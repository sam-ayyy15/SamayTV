"use client";

import { useState } from "react";
import type { MediaType, MovieDetail, TvDetail } from "@/lib/tmdb";
import DetailHeader from "@/components/detail/DetailHeader";
import SeasonsAccordion from "@/components/detail/SeasonsAccordion";
import Player from "@/components/player/Player";

export default function DetailClient({
  mediaType,
  detail,
}: {
  mediaType: MediaType;
  detail: MovieDetail | TvDetail;
}) {
  const [player, setPlayer] = useState<{ season?: number; episode?: number } | null>(null);

  const title = mediaType === "movie" ? (detail as MovieDetail).title : (detail as TvDetail).name;

  function handleWatch(season?: number, episode?: number) {
    setPlayer({ season, episode });
  }

  return (
    <>
      <DetailHeader mediaType={mediaType} detail={detail} onWatch={handleWatch} />

      {mediaType === "tv" && (
        <div className="px-[clamp(20px,4vw,56px)]">
          <SeasonsAccordion
            tvId={detail.id}
            seasons={(detail as TvDetail).seasons}
            onWatchEpisode={(s, e) => handleWatch(s, e)}
          />
        </div>
      )}

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
    </>
  );
}
