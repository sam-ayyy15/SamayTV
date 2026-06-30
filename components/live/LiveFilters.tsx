"use client";

import { motion } from "framer-motion";
import type { IptvCategory, IptvCountry } from "@/lib/iptv";

interface LiveFiltersProps {
  categories: IptvCategory[];
  countries: IptvCountry[];
  selectedCategory: string;
  selectedCountry: string;
  search: string;
  onCategoryChange: (id: string) => void;
  onCountryChange: (code: string) => void;
  onSearchChange: (q: string) => void;
}

export default function LiveFilters({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  search,
  onCategoryChange,
  onCountryChange,
  onSearchChange,
}: LiveFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search channels…"
          className="w-full rounded-full border border-white/12 bg-white/6 py-2.5 pl-10 pr-4
            text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200
            focus:border-white/25 focus:bg-white/9"
        />
      </div>

      {/* Category pills */}
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Category
        </p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label="All"
            active={selectedCategory === ""}
            onClick={() => onCategoryChange("")}
          />
          {categories
            .filter((c) => c.id !== "xxx") // hide adult
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cat) => (
              <FilterPill
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onClick={() => onCategoryChange(selectedCategory === cat.id ? "" : cat.id)}
              />
            ))}
        </div>
      </div>

      {/* Country select */}
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Country
        </p>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full appearance-none rounded-full border border-white/12 bg-white/6 py-2.5 pl-4 pr-10
              text-sm text-white outline-none transition-all duration-200 focus:border-white/25
              [&>option]:bg-[#0e0e12] [&>option]:text-white"
          >
            <option value="">All Countries</option>
            {countries
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
        active
          ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
          : "border border-white/14 bg-white/6 text-white/65 hover:border-white/25 hover:text-white/90"
      }`}
    >
      {label}
    </motion.button>
  );
}
