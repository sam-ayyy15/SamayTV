"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

export default function SearchBar({ focused, onFocus, onBlur }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sync external focused state → DOM focus
  useEffect(() => {
    if (!focused) inputRef.current?.blur();
  }, [focused]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200"
      style={{
        background: focused ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${focused ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(255,255,255,0.05)" : "none",
      }}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 transition-colors duration-200"
        style={{ color: focused ? "#fff" : "rgba(255,255,255,0.5)" }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        placeholder="Type / to search"
        aria-label="Search movies and shows"
        onFocus={onFocus}
        onBlur={onBlur}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/45 focus:outline-none"
      />

      {!focused && (
        <kbd
          className="hidden shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/35 sm:block"
          style={{ fontFamily: "inherit" }}
        >
          /
        </kbd>
      )}
    </form>
  );
}
