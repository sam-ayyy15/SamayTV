import type { VylaSubtitle } from "@/lib/vyla";

export default function SubtitleMenu({
  subtitles,
  activeLabel,
  onSelect,
}: {
  subtitles: VylaSubtitle[];
  activeLabel: string | null;
  onSelect: (label: string | null) => void;
}) {
  if (subtitles.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Subtitles</span>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSelect(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
            activeLabel === null
              ? "border-white bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.2)]"
              : "border-hairline text-text-secondary hover:border-white/30 hover:text-white"
          }`}
        >
          Off
        </button>
        {subtitles.map((sub) => (
          <button
            key={sub.label}
            onClick={() => onSelect(sub.label)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
              activeLabel === sub.label
                ? "border-white bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                : "border-hairline text-text-secondary hover:border-white/30 hover:text-white"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>
    </div>
  );
}
