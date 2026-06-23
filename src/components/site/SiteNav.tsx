"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Upload } from "lucide-react";
import { clsx } from "clsx";
import { WexmeLogo } from "@/components/brand/WexmeLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/standings", label: "Standings" },
  { href: "/leaders", label: "Leaders" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass hairline" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="WeXmE home">
          <WexmeLogo className="text-[1.6rem]" />
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(l.href)
                  ? "text-fg"
                  : "text-muted hover:text-fg"
              )}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent" />
              )}
            </Link>
          ))}
          <Link
            href="/statistician"
            className={clsx(
              "ml-2 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
              "bg-accent text-black hover:bg-accent-2"
            )}
          >
            <Upload className="h-4 w-4" />
            Statistician
          </Link>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-fg md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="glass hairline md:hidden">
          <div className="space-y-1 px-4 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "block rounded-lg px-3 py-2.5 text-base font-medium",
                  isActive(l.href)
                    ? "bg-surface-2 text-fg"
                    : "text-muted"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/statistician"
              className="mt-1 flex items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-base font-semibold text-black"
            >
              <Upload className="h-4 w-4" />
              Statistician Upload
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
