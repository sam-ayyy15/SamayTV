"use client";

import { motion, type Variants } from "framer-motion";

const contacts = [
  {
    label: "Samay Shetty",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 shrink-0">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
      </svg>
    ),
    href: null,
  },
  {
    label: "samayshetty1234@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 shrink-0">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" strokeLinecap="round" />
      </svg>
    ),
    href: "mailto:samayshetty1234@gmail.com",
  },
  {
    label: "+91 998710987",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 shrink-0">
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    href: "tel:+91998710987",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Footer() {
  return (
    <footer
      className="relative mt-20 border-t"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Top gradient bleed — keeps hover cards from visually colliding with footer */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.0))" }}
      />

      <div className="mx-auto px-[clamp(20px,4vw,56px)] py-14">
        {/* Brand row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          {/* Logo wordmark */}
          <motion.div variants={itemVariants} className="flex items-center gap-1.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[13px] font-black text-black select-none"
              style={{ background: "#ffffff" }}
            >
              S
            </span>
            <span className="text-[18px] font-bold text-white tracking-[-0.02em] leading-none">
              amay TV
            </span>
          </motion.div>

          {/* Contact items */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col items-center gap-3 sm:items-end"
          >
            {contacts.map((c) => {
              const inner = (
                <motion.span
                  variants={itemVariants}
                  key={c.label}
                  className="group flex items-center gap-2.5 text-[13px] text-white/50 transition-colors duration-200 hover:text-white"
                >
                  <span className="text-white/30 transition-colors duration-200 group-hover:text-white/70">
                    {c.icon}
                  </span>
                  {c.label}
                </motion.span>
              );

              return c.href ? (
                <a key={c.label} href={c.href}>
                  {inner}
                </a>
              ) : (
                <span key={c.label}>{inner}</span>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="my-10 h-px"
          aria-hidden
          style={{ background: "rgba(255,255,255,0.06)", transformOrigin: "left" }}
        />

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-between gap-2 text-[11px] text-white/25 sm:flex-row"
        >
          <p>© {new Date().getFullYear()} Samay TV. All rights reserved.</p>
          <p>Built with Next.js · TMDB · Vyla API</p>
        </motion.div>
      </div>
    </footer>
  );
}
