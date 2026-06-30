"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { tmdbImage, type CastMember } from "@/lib/tmdb";

export default function CastList({ cast }: { cast: CastMember[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cast : cast.slice(0, 7);

  if (cast.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Cast &amp; Credits
      </h3>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((member, i) => {
            const avatar = tmdbImage(member.profile_path, "w185");
            return (
              <motion.li
                key={member.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 group"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-elevated ring-1 ring-white/8 transition-all duration-200 group-hover:ring-white/20">
                  {avatar ? (
                    <Image src={avatar} alt={member.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-text-tertiary font-semibold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white/90 transition-colors duration-200 group-hover:text-white">{member.name}</p>
                  <p className="truncate text-xs text-text-secondary leading-relaxed">{member.character}</p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {cast.length > 7 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 w-full rounded-full border border-hairline bg-white/3 py-2 text-xs font-medium text-white/80 transition-all duration-200 hover:bg-white/8 hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {expanded ? "Show Less" : `Show All ${cast.length}`}
        </button>
      )}
    </div>
  );
}
