import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-card": "var(--bg-card)",
        "bg-nav": "var(--bg-nav)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        accent: "var(--accent)",
        "accent-on": "var(--accent-on)",
        "accent-hover": "var(--accent-hover)",
        hairline: "var(--hairline)",
        "hairline-strong": "var(--hairline-strong)",
        "surface-hover": "var(--surface-hover)",
        "score-high": "var(--score-high)",
        "score-mid": "var(--score-mid)",
        "score-low": "var(--score-low)",
        "score-track": "var(--score-track)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.32, 0.72, 0, 1)",
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "ring-fill": "ring-fill 1s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ring-fill": {
          "0%": { strokeDashoffset: "var(--circumference)" },
          "100%": { strokeDashoffset: "var(--offset)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
