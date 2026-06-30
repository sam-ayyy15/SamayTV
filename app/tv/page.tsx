import { tmdbServer } from "@/lib/tmdb-server";
import PosterRail from "@/components/cards/PosterRail";

export const revalidate = 300;

export default async function TvPage() {
  const [onTheAir, popular] = await Promise.all([
    tmdbServer.onTheAir(),
    tmdbServer.popularTv(),
  ]);

  return (
    <main className="px-[clamp(20px,4vw,56px)] py-12">
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Browse</p>
        <h1 className="font-display text-4xl font-bold text-white">TV Shows</h1>
      </div>
      <PosterRail title="On The Air" items={onTheAir.results} defaultMediaType="tv" />
      <PosterRail title="Popular" items={popular.results} defaultMediaType="tv" />
    </main>
  );
}
