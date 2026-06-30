import Image from "next/image";
import { tmdbImage, type WatchProviderRegion } from "@/lib/tmdb";

export default function ProviderStrip({
  region,
}: {
  region: WatchProviderRegion | undefined;
}) {
  const providers = [
    ...(region?.flatrate ?? []),
    ...(region?.buy ?? []),
    ...(region?.rent ?? []),
  ];
  const unique = Array.from(new Map(providers.map((p) => [p.provider_id, p])).values());

  if (unique.length === 0) return null;

  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Available on
      </p>
      <div className="flex flex-wrap gap-2">
        {unique.map((p) => {
          const logo = tmdbImage(p.logo_path, "w185");
          return (
            <div
              key={p.provider_id}
              className="relative h-9 w-9 overflow-hidden rounded-xl bg-bg-elevated ring-1 ring-white/8 transition-all duration-200 hover:ring-white/25 hover:scale-110"
              title={p.provider_name}
            >
              {logo && <Image src={logo} alt={p.provider_name} fill className="object-cover" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
