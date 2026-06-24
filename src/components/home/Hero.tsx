"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { WexmeHeroMark } from "@/components/home/WexmeHeroMark";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const ease = [0.2, 0.7, 0.2, 1] as const;

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden">
      <div className="court-lines pointer-events-none absolute inset-0" />
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[60vh] w-[60vh] rounded-full opacity-40 blur-3xl"
      >
        <div
          className="h-full w-full animate-floaty rounded-full"
          style={{ background: `radial-gradient(circle, var(--color-accent), transparent 65%)` }}
        />
      </motion.div>

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="eyebrow"
        >
          Basketball Statistics
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease }}
          className="font-display mt-4 text-[clamp(3rem,10vw,9rem)] uppercase leading-[1.05]"
        >
          Every bucket.
          <br />
          <span className="text-gradient">Every Games.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          Every bucket, board and buzzer-beater, captured. Dive into live box
          scores, standings, leaderboards and player breakdowns for basketball
          leagues of all ages, only on{" "}
          <span className="text-fg">WeXmE</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/games"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-black transition-colors hover:bg-accent-2"
          >
            Explore the games
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* explosive animated WeXmE mark (replaces the old featured-game card) */}
        <motion.div
          style={{ y }}
          className="mt-14 flex justify-center lg:absolute lg:right-10 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2"
        >
          <WexmeHeroMark />
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="eyebrow mb-1.5 text-faint">Scroll to unfold the game statistics</p>
        <ChevronDown className="mx-auto h-5 w-5 animate-bounce text-faint" />
      </motion.div>
    </section>
  );
}
