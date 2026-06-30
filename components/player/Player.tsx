"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import { streamVyla, type VylaSource, type VylaSubtitle } from "@/lib/vyla";
import SourceSwitcher from "@/components/player/SourceSwitcher";
import SubtitleMenu from "@/components/player/SubtitleMenu";

interface PlayerProps {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
  title: string;
  onClose: () => void;
}

type PlayerStatus = "connecting" | "playing" | "unavailable" | "error";

export default function Player({ type, id, season, episode, title, onClose }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const sourcesRef = useRef<VylaSource[]>([]);

  const [status, setStatus] = useState<PlayerStatus>("connecting");
  const [sources, setSources] = useState<VylaSource[]>([]);
  const [subtitles, setSubtitles] = useState<VylaSubtitle[]>([]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  function playSource(source: VylaSource) {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    setActiveUrl(source.url);
    setStatus("playing");

    if (source.url.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          const next = sourcesRef.current.find((s) => s.url !== source.url);
          if (next) {
            playSource(next);
          } else {
            setStatus("unavailable");
          }
        }
      });
    } else {
      video.src = source.url;
      video.play().catch(() => {});
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    let started = false;

    (async () => {
      try {
        for await (const event of streamVyla({ type, id, season, episode }, controller.signal)) {
          if (event.type === "meta") {
            setSubtitles(event.subtitles ?? []);
          }
          if (event.type === "source") {
            sourcesRef.current = [...sourcesRef.current, event.source];
            setSources((prev) => [...prev, event.source]);
            if (!started) {
              started = true;
              playSource(event.source);
            }
          }
          if (event.type === "done") {
            if (!started) setStatus("unavailable");
          }
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();

    return () => {
      controller.abort();
      hlsRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id, season, episode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (const track of Array.from(video.textTracks)) {
      track.mode = track.label === activeSubtitle ? "showing" : "disabled";
    }
  }, [activeSubtitle, subtitles]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">{title}</p>
              {season && episode && (
                <p className="text-xs text-text-secondary">S{season} · E{episode}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close player"
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-white/5 text-text-secondary transition-all duration-200 hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Video container */}
          <div
            className="relative aspect-video w-full overflow-hidden rounded-2xl bg-bg-elevated"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)" }}
          >
            <video ref={videoRef} controls className="h-full w-full" playsInline>
              {subtitles.map((sub) => (
                <track
                  key={sub.label}
                  kind="subtitles"
                  label={sub.label}
                  srcLang="en"
                  src={sub.file}
                  default={sub.label === activeSubtitle}
                />
              ))}
            </video>

            {/* Status overlays */}
            <AnimatePresence>
              {status !== "playing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80"
                >
                  {status === "connecting" && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white"
                      />
                      <p className="text-sm text-text-secondary">Finding streaming sources…</p>
                    </>
                  )}
                  {status === "unavailable" && (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-bg-elevated">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6 text-text-secondary">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white">Not available to stream</p>
                      <p className="text-xs text-text-secondary">Try again later or use the download option</p>
                    </>
                  )}
                  {status === "error" && (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-bg-elevated">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6 text-text-secondary">
                          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white">Playback error</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-1 rounded-full border border-hairline px-4 py-1.5 text-xs text-white hover:bg-white/10"
                      >
                        Try again
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls below video */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SourceSwitcher sources={sources} activeUrl={activeUrl} onSelect={playSource} />
            <SubtitleMenu
              subtitles={subtitles}
              activeLabel={activeSubtitle}
              onSelect={setActiveSubtitle}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
