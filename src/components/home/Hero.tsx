"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Upload } from "lucide-react";
import type { Game, Team } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LeagueTag } from "@/components/ui/SectionHeading";
import { formatDateLong } from "@/lib/format";

export function Hero({
  game,
  home,
  away,
}: {
  game: Game;
  home: Team;
  away: Team;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const winScore = Math.max(game.homeScore, game.awayScore);
  const winner = game.homeScore > game.awayScore ? home : away;

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
          style={{ background: `radial-gradient(circle, ${winner.primary}, transparent 65%)` }}
        />
      </motion.div>

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="eyebrow"
        >
          United Arab Emirates · Amateur Hoops
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease }}
          className="font-display mt-3 text-[clamp(2.8rem,9vw,7.5rem)] uppercase leading-[0.85]"
        >
          Every bucket.
          <br />
          <span className="text-gradient">Every night.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          Box scores, standings, leaderboards and game-night stories for amateur
          leagues — every stat straight from{" "}
          <span className="text-fg">Courtside Live</span>.
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
          <Link
            href="/statistician"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-4 w-4" />
            Statistician upload
          </Link>
        </motion.div>

        {/* featured latest result */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="mt-14 lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:w-[360px] lg:-translate-y-1/2"
        >
          <Link
            href={`/games/${game.id}`}
            className="card card-hover noise glass block overflow-hidden p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <LeagueTag league={game.league} />
              <span className="text-xs text-faint">Latest · FINAL</span>
            </div>
            <ScoreRow team={away} score={game.awayScore} win={game.awayScore > game.homeScore} />
            <div className="my-2.5 h-px bg-line" />
            <ScoreRow team={home} score={game.homeScore} win={game.homeScore > game.awayScore} />
            <p className="mt-4 text-sm text-muted">{game.headline}</p>
            <p className="mt-1 text-xs text-faint">{formatDateLong(game.date)}</p>
          </Link>
          <p className="mt-3 text-center font-display text-7xl text-white/5">{winScore}</p>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="eyebrow mb-1.5 text-faint">Scroll to unfold the night</p>
        <ChevronDown className="mx-auto h-5 w-5 animate-bounce text-faint" />
      </motion.div>
    </section>
  );
}

function ScoreRow({ team, score, win }: { team: Team; score: number; win: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <TeamCrest team={team} className="h-10 w-10 text-sm" />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${win ? "text-fg" : "text-muted"}`}>{team.name}</p>
        <p className="text-xs text-faint">{team.city}</p>
      </div>
      <span className={`stat-num font-display text-4xl ${win ? "text-accent" : "text-muted"}`}>
        {score}
      </span>
    </div>
  );
}
