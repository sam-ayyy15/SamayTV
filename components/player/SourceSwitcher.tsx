import type { VylaSource } from "@/lib/vyla";

export default function SourceSwitcher({
  sources,
  activeUrl,
  onSelect,
}: {
  sources: VylaSource[];
  activeUrl: string | null;
  onSelect: (source: VylaSource) => void;
}) {
  if (sources.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Source</span>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s) => (
          <button
            key={s.url}
            onClick={() => onSelect(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
              s.url === activeUrl
                ? "border-white bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                : "border-hairline text-text-secondary hover:border-white/30 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
