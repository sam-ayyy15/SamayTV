"use client";

import { useState } from "react";
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

/* Exact same visual spec as the main SearchBar in TopNav */
const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.22)",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
  color: "#ffffff",
};
const inputFocus: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.35)",
  boxShadow: "0 0 0 3px rgba(255,255,255,0.05)",
};

function StyledInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-2.5 rounded-full px-3.5 py-2.5 transition-all duration-200"
      style={focused ? { ...inputBase, ...inputFocus } : inputBase}
    >
      {/* Magnifier — matches TopNav SearchBar icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 transition-colors duration-200"
        style={{ color: focused ? "#fff" : "rgba(255,255,255,0.5)" }}
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/45 focus:outline-none"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="shrink-0 text-white/35 hover:text-white/70 transition-colors duration-150"
          aria-label="Clear"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-full py-2.5 pl-4 pr-10 text-[13px] focus:outline-none
          transition-all duration-200 cursor-pointer"
        style={{
          ...(focused ? { ...inputBase, ...inputFocus } : inputBase),
          colorScheme: "dark",
        }}
      >
        {children}
      </select>
      {/* Custom chevron */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
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
    <div className="space-y-5">
      {/* Channel search — same look as TopNav SearchBar */}
      <StyledInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search channels…"
      />

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
            .filter((c) => c.id !== "xxx")
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

      {/* Country dropdown — same look as channel search */}
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Country
        </p>
        <StyledSelect value={selectedCountry} onChange={onCountryChange}>
          <option value="" style={{ background: "#0e0e12" }}>🌐 All Countries</option>
          {countries
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#0e0e12" }}>
                {c.flag} {c.name}
              </option>
            ))}
        </StyledSelect>
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
