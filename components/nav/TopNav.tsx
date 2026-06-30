"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PillNav from "@/components/nav/PillNav";
import SearchBar from "@/components/nav/SearchBar";

// Stagger variants for right-side nav items
const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-[background,backdrop-filter] duration-500"
      style={{
        background: scrolled ? "rgba(8,8,10,0.55)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="flex items-center gap-3 px-6 h-[52px]">

        {/* ── Logo ─────────────────────────────────────── */}
        <motion.div
          custom={0}
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className="shrink-0 mr-3"
        >
          <Link href="/" className="flex items-center gap-1.5 group" aria-label="Samay TV home">
            <motion.span
              className="flex h-6 w-6 items-center justify-center rounded-[5px] text-[13px] font-black text-black leading-none select-none"
              style={{ background: "#ffffff" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              S
            </motion.span>
            <span className="text-[17px] font-bold text-white tracking-[-0.02em] leading-none transition-opacity duration-200 group-hover:opacity-75">
              amay TV
            </span>
          </Link>
        </motion.div>

        {/* ── Search bar — expands into the spacer on focus ── */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className={searchFocused ? "flex-1" : "w-[260px] shrink-0"}
        >
          <SearchBar
            focused={searchFocused}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>

        {/* Spacer — collapses when search is focused */}
        <AnimatePresence initial={false}>
          {!searchFocused && (
            <motion.div
              key="spacer"
              className="flex-1"
              initial={{ opacity: 0, flexGrow: 0 }}
              animate={{ opacity: 1, flexGrow: 1 }}
              exit={{ opacity: 0, flexGrow: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

        {/* ── Right-side items — fade out when search expands ── */}
        <AnimatePresence initial={false}>
          {!searchFocused && (
            <motion.div
              key="right-items"
              className="flex items-center gap-2 shrink-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hamburger */}
              <motion.button
                aria-label="Menu"
                className="flex items-center justify-center w-8 h-8 text-white/60 hover:text-white transition-colors duration-150"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                custom={1}
                variants={navVariants}
                initial="hidden"
                animate="visible"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>

              {/* Movies / TV */}
              <motion.div
                custom={2}
                variants={navVariants}
                initial="hidden"
                animate="visible"
              >
                <PillNav />
              </motion.div>

              {/* Profile avatar */}
              <motion.button
                aria-label="Profile"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                custom={3}
                variants={navVariants}
                initial="hidden"
                animate="visible"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-4 w-4 text-white/70"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button — only shown when search is expanded */}
        <AnimatePresence>
          {searchFocused && (
            <motion.button
              key="close-search"
              aria-label="Close search"
              onClick={() => setSearchFocused(false)}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150"
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
