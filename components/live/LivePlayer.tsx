"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IptvChannel, IptvStream } from "@/lib/iptv";

interface LivePlayerProps {
  channel: IptvChannel;
  streams: IptvStream[];
  onClose: () => void;
}

export default function LivePlayer({ channel, streams, onClose }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const hlsRef = useRef<import("hls.js").default | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || streams.length === 0) {
      setStatus("error");
      return;
    }

    const url = streams[streamIndex]?.url;
    if (!url) { setStatus("error"); return; }

    let destroyed = false;

    async function initPlayer() {
      if (!video) return;
      setStatus("loading");

      // Destroy previous hls instance
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

      const isHls = url.includes(".m3u8") || url.includes("m3u8");

      if (isHls) {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!destroyed) { video.play().catch(() => {}); setStatus("playing"); }
          });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
            if (data.fatal && !destroyed) tryNextStream();
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS
          video.src = url;
          video.play().catch(() => {});
          if (!destroyed) setStatus("playing");
        } else {
          if (!destroyed) setStatus("error");
        }
      } else {
        video.src = url;
        video.play().catch(() => {});
        if (!destroyed) setStatus("playing");
      }
    }

    initPlayer();

    return () => {
      destroyed = true;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (video) { video.pause(); video.src = ""; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamIndex, streams]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function tryNextStream() {
    if (streamIndex < streams.length - 1) {
      setStreamIndex((i) => i + 1);
    } else {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="live-player"
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/92"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.9)" }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between gap-4 px-5 py-3"
            style={{ background: "rgba(14,14,18,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {channel.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={channel.logo} alt="" className="h-7 w-7 rounded-md object-contain bg-white/10" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">{channel.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] text-white/45">LIVE</span>
                </div>
              </div>
            </div>
            {streams.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                {streams.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStreamIndex(i)}
                    className={`h-1.5 w-4 rounded-full transition-all duration-200 ${
                      i === streamIndex ? "bg-white" : "bg-white/25 hover:bg-white/45"
                    }`}
                    aria-label={`Stream ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close player"
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Video */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              autoPlay
            />
            {status === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-xs text-white/50">Connecting to stream…</p>
              </div>
            )}
            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-white/30">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
                <p className="text-sm font-medium text-white/60">Stream unavailable</p>
                <p className="text-xs text-white/35">This channel has no working streams right now.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
