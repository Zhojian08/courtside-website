"use client";

import { motion } from "framer-motion";

/**
 * Explosive, colour-shifting WeXmE wordmark for the hero.
 * Rotating starburst + pulsing glow + bursting particles, with the letters
 * panning through a full-spectrum gradient. Pure CSS animation (see globals.css)
 * plus a Framer-Motion entrance "explosion".
 */

// On-brand burst particles, fired outward on a loop. Deterministic (no random).
const PARTICLES = [
  { x: 150, y: -40, color: "#2f7dff", d: 2.2, delay: 0 },
  { x: -160, y: 30, color: "#73a9ff", d: 2.6, delay: 0.4 },
  { x: 120, y: 120, color: "#a472ff", d: 2.4, delay: 0.8 },
  { x: -120, y: -120, color: "#22c3e6", d: 2.8, delay: 1.1 },
  { x: 185, y: 60, color: "#ff5d8f", d: 2.5, delay: 0.6 },
  { x: -180, y: -60, color: "#2fd27a", d: 2.7, delay: 1.4 },
  { x: 40, y: -165, color: "#ffb020", d: 2.3, delay: 0.2 },
  { x: -50, y: 165, color: "#73a9ff", d: 2.9, delay: 1.7 },
  { x: 165, y: -120, color: "#2f7dff", d: 2.6, delay: 1.0 },
  { x: -165, y: 120, color: "#a472ff", d: 2.4, delay: 0.5 },
];

export function WexmeHeroMark() {
  return (
    <div className="wexme-hero relative grid place-items-center">
      <div className="wexme-burst" aria-hidden />
      <div className="wexme-burst alt" aria-hidden />
      <div className="wexme-glow" aria-hidden />

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="wexme-particle"
          style={{ color: p.color, marginLeft: -3.5, marginTop: -3.5 }}
          animate={{ x: [0, p.x], y: [0, p.y], opacity: [0, 1, 0], scale: [0.4, 1, 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="relative z-10"
        initial={{ scale: 0.35, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 130, damping: 12, delay: 0.15 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="wexme-wordmark wexme-hero-mark">
            <span className="wexme-cycle">We</span>
            <span className="wexme-cycle wexme-x">X</span>
            <span className="wexme-cycle">mE</span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
