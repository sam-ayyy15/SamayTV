"use client";

import { useEffect, useRef, useState } from "react";
import { scoreColor, scorePercent } from "@/lib/score";

interface RatingRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function RatingRing({
  value,
  size = 40,
  strokeWidth = 3,
  className,
}: RatingRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = scorePercent(value);
  const targetOffset = circumference - (percent / 100) * circumference;
  const color = scoreColor(value);
  const [offset, setOffset] = useState(circumference);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const frame = requestAnimationFrame(() => setOffset(targetOffset));
      return () => cancelAnimationFrame(frame);
    }
  }, [targetOffset]);

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(0,0,0,0.6)"
          stroke="var(--score-track)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold text-white"
        style={{ fontSize: size * 0.28, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
      >
        {value > 0 ? value.toFixed(1) : "–"}
      </span>
    </div>
  );
}
