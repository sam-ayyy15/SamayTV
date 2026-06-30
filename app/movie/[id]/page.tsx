import Image from "next/image";
import { tmdbServer } from "@/lib/tmdb-server";
import { pickTrailer, tmdbImage } from "@/lib/tmdb";
import DetailClient from "@/components/detail/DetailClient";
import TrailerEmbed from "@/components/detail/TrailerEmbed";

export const revalidate = 300;

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await tmdbServer.movieDetail(id);
  const backdrop = tmdbImage(detail.backdrop_path, "original");
  const trailer = pickTrailer(detail.videos?.results);

  return (
    <main className="relative pb-20">
      {/* Cinematic backdrop */}
      {backdrop && (
        <div className="absolute inset-x-0 top-0 h-[70vh] -z-10 overflow-hidden">
          <Image
            src={backdrop}
            alt={detail.title}
            fill
            priority
            sizes="100vw"
            className="object-cover backdrop-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          {/* Vignette */}
          <div className="absolute inset-0 vignette" />
        </div>
      )}

      <DetailClient mediaType="movie" detail={detail} />

      <div className="px-[clamp(20px,4vw,56px)]">
        {detail.overview && (
          <section className="max-w-2xl py-8">
            <div className="mb-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Synopsis</p>
              <h2 className="section-title font-sans text-base font-semibold uppercase tracking-[0.08em] text-white">Overview</h2>
            </div>
            <p className="text-sm leading-[1.8] text-text-secondary">{detail.overview}</p>
          </section>
        )}
        <TrailerEmbed trailer={trailer} />
      </div>
    </main>
  );
}
