import { tmdbServer } from "@/lib/tmdb-server";
import { pickLogo } from "@/lib/tmdb";
import Hero from "@/components/home/Hero";
import Top10Rail from "@/components/cards/Top10Rail";
import PosterRail from "@/components/cards/PosterRail";

export const revalidate = 300;

export default async function HomePage() {
  const [trendingAll, trendingTv, onTheAir, popularMovies, popularTv, topRatedMovies] =
    await Promise.all([
      tmdbServer.trendingAllDay(),
      tmdbServer.trendingTvDay(),
      tmdbServer.onTheAir(),
      tmdbServer.popularMovies(),
      tmdbServer.popularTv(),
      tmdbServer.topRatedMovies(),
    ]);

  const heroItems = trendingAll.results.slice(0, 5);
  const logoEntries = await Promise.all(
    heroItems.map(async (item) => {
      try {
        const images =
          (item.media_type ?? "movie") === "tv"
            ? await tmdbServer.tvImages(item.id)
            : await tmdbServer.movieImages(item.id);
        return [item.id, pickLogo(images.logos)] as const;
      } catch {
        return [item.id, null] as const;
      }
    }),
  );
  const logos = Object.fromEntries(logoEntries);

  return (
    <main>
      <Hero items={heroItems} logos={logos} />
      <div className="px-[clamp(20px,4vw,56px)]">
        <Top10Rail items={trendingTv.results} defaultMediaType="tv" />
        <PosterRail
          title="On The Air"
          items={onTheAir.results}
          defaultMediaType="tv"
          viewAllHref="/tv"
        />
        <PosterRail
          title="Popular Movies"
          items={popularMovies.results}
          defaultMediaType="movie"
          viewAllHref="/movies"
        />
        <PosterRail
          title="Popular TV"
          items={popularTv.results}
          defaultMediaType="tv"
          viewAllHref="/tv"
        />
        <PosterRail
          title="Top Rated Movies"
          items={topRatedMovies.results}
          defaultMediaType="movie"
          viewAllHref="/movies"
        />
      </div>
    </main>
  );
}
