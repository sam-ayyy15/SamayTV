"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { iptv } from "@/lib/iptv";
import type { IptvChannel, IptvCategory, IptvCountry } from "@/lib/iptv";
import ChannelCard from "@/components/live/ChannelCard";
import LiveFilters from "@/components/live/LiveFilters";

const PAGE_SIZE = 60;

export default function LivePage() {
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [categories, setCategories] = useState<IptvCategory[]>([]);
  const [countries, setCountries] = useState<IptvCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([iptv.channels(), iptv.categories(), iptv.countries()])
      .then(([ch, cats, ctrs]) => {
        // Filter out closed channels and NSFW
        setChannels(ch.filter((c) => !c.is_closed && !c.is_nsfw && c.id));
        setCategories(cats);
        setCountries(ctrs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load channels");
        setLoading(false);
      });
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, selectedCategory, selectedCountry]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return channels.filter((ch) => {
      if (q && !ch.name.toLowerCase().includes(q)) return false;
      if (selectedCategory && !ch.categories.includes(selectedCategory)) return false;
      if (selectedCountry && ch.country !== selectedCountry) return false;
      return true;
    });
  }, [channels, search, selectedCategory, selectedCountry]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // Count channels per category for populated categories
  const activeCategoryIds = useMemo(() => {
    const counts = new Map<string, number>();
    channels.forEach((ch) => ch.categories.forEach((cat) => counts.set(cat, (counts.get(cat) ?? 0) + 1)));
    return counts;
  }, [channels]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.id !== "xxx" && (activeCategoryIds.get(c.id) ?? 0) > 0),
    [categories, activeCategoryIds],
  );

  const visibleCountries = useMemo(() => {
    const codes = new Set(channels.map((c) => c.country));
    return countries.filter((c) => codes.has(c.code));
  }, [channels, countries]);

  return (
    <main className="min-h-screen px-[clamp(16px,3vw,48px)] pb-24 pt-[76px]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 pt-6"
      >
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Streaming
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-bold text-white">Live TV</h1>
          {!loading && (
            <span className="text-sm text-white/35">
              {filtered.length.toLocaleString()} channels
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-white/40">Live Tv Channels</span>
        </div>
      </motion.div>

      {/* Filters */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <LiveFilters
            categories={visibleCategories}
            countries={visibleCountries}
            selectedCategory={selectedCategory}
            selectedCountry={selectedCountry}
            search={search}
            onCategoryChange={setSelectedCategory}
            onCountryChange={setSelectedCountry}
            onSearchChange={setSearch}
          />
        </motion.div>
      )}

      {/* States */}
      {loading && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-white/25">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-white/50">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white/70 hover:bg-white/8 transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-white/25">
            <path d="M3 4a1 1 0 000 2h.586L2.293 7.293a1 1 0 001.414 1.414L5 7.414V8a1 1 0 002 0V7.414l1.293 1.293a1 1 0 001.414-1.414L8.414 6H9a1 1 0 000-2H3zM2 10a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5z" />
          </svg>
          <p className="text-sm text-white/45">No channels match your filters</p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(""); setSelectedCountry(""); }}
            className="text-xs text-white/35 hover:text-white/60 transition-colors duration-150"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Channel grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {paginated.map((channel, i) => (
              <ChannelCard key={channel.id} channel={channel} index={i} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <motion.button
                onClick={() => setPage((p) => p + 1)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="rounded-full border border-white/18 bg-white/6 px-8 py-2.5 text-sm font-medium
                  text-white/70 transition-all duration-200 hover:bg-white/12 hover:text-white"
              >
                Load more · {(filtered.length - paginated.length).toLocaleString()} remaining
              </motion.button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
