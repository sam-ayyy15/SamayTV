"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Movies",
    href: "/movies",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path d="M2 4.5A2.5 2.5 0 014.5 2h11A2.5 2.5 0 0118 4.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 15.5v-11zM4.5 4a.5.5 0 00-.5.5v.5h.5a.5.5 0 000-1H4.5zM6 4h8v1H6V4zm9.5 0h-.5a.5.5 0 000 1h.5V4.5a.5.5 0 00-.5-.5h.5zm0 3h-.5a.5.5 0 000 1h.5V7zm0 3h-.5a.5.5 0 000 1h.5V10zM4 7.5v1h.5a.5.5 0 000-1H4zm0 3v1h.5a.5.5 0 000-1H4zM8 6.5a.5.5 0 01.8-.4l4 3a.5.5 0 010 .8l-4 3A.5.5 0 018 12.5v-6z" />
      </svg>
    ),
  },
  {
    label: "TV",
    href: "/tv",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path d="M3 4a1 1 0 000 2h.586L2.293 7.293a1 1 0 001.414 1.414L5 7.414V8a1 1 0 002 0V7.414l1.293 1.293a1 1 0 001.414-1.414L8.414 6H9a1 1 0 000-2H3zM2 10a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5z" />
      </svg>
    ),
  },
  {
    label: "Live TV",
    href: "/live",
    live: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function PillNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main navigation">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <motion.div
            key={item.href}
            whileHover={{ scale: active ? 1 : 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200",
                active
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {"live" in item && item.live && !active && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              {!("live" in item && item.live && !active) && item.icon}
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
