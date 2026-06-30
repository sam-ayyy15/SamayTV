"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { IptvChannel, IptvStream } from "@/lib/iptv";
import { iptv, streamsForChannel } from "@/lib/iptv";
import LivePlayer from "./LivePlayer";

interface ChannelCardProps {
  channel: IptvChannel;
  index?: number;
}

export default function ChannelCard({ channel, index = 0 }: ChannelCardProps) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [streams, setStreams] = useState<IptvStream[]>([]);

  async function handleWatch() {
    setState("loading");
    try {
      const all = await iptv.streams();
      const found = streamsForChannel(all, channel.id);
      setStreams(found);
      setState("playing");
    } catch {
      setState("idle");
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.4), ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          background: "rgba(14,14,18,0.65)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
        }}
        whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
      >
        {/* Logo area */}
        <div
          className="relative flex h-32 items-center justify-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {channel.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.logo}
              alt={channel.name}
              className="max-h-16 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/8 text-lg font-bold text-white/40">
              {channel.name.charAt(0)}
            </div>
          )}

          {/* LIVE badge */}
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>

          {/* Watch overlay */}
          <motion.button
            onClick={handleWatch}
            disabled={state === "loading"}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100"
            aria-label={`Watch ${channel.name}`}
            whileTap={{ scale: 0.96 }}
          >
            {state === "loading" ? (
              <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
                style={{ boxShadow: "0 0 24px rgba(255,255,255,0.3)" }}
              >
                <svg viewBox="0 0 24 24" fill="black" className="h-4 w-4 translate-x-0.5">
                  <path d="M6 4.5v15l13-7.5-13-7.5z" />
                </svg>
              </div>
            )}
          </motion.button>
        </div>

        {/* Channel info */}
        <div className="flex flex-col gap-1 p-3">
          <p className="truncate text-[13px] font-semibold text-white/90 leading-snug">
            {channel.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {channel.country && (
              <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-medium text-white/45">
                {channel.country}
              </span>
            )}
            {channel.categories.slice(0, 1).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-medium capitalize text-white/45"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Watch button (always visible on mobile / touch) */}
        <button
          onClick={handleWatch}
          disabled={state === "loading"}
          className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-full bg-white/8 py-2
            text-[12px] font-semibold text-white/80 transition-all duration-200
            hover:bg-white hover:text-black md:hidden"
        >
          {state === "loading" ? (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6 4.5v15l13-7.5-13-7.5z" />
            </svg>
          )}
          Watch
        </button>
      </motion.div>

      {/* Player modal */}
      {state === "playing" && (
        <LivePlayer
          channel={channel}
          streams={streams}
          onClose={() => { setState("idle"); setStreams([]); }}
        />
      )}
    </>
  );
}
