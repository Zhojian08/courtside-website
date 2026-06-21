import Link from "next/link";
import { BallMark } from "@/components/brand/BallMark";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <BallMark className="h-8 w-8" />
              <span className="font-display text-2xl tracking-wide">
                COURT<span className="text-accent">SIDE</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Pro-grade coverage for amateur basketball. Box scores, standings,
              leaderboards and game-night stories — powered by{" "}
              <span className="text-fg">Courtside Live</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Explore"
              links={[
                { href: "/games", label: "Games" },
                { href: "/standings", label: "Standings" },
                { href: "/leaders", label: "Leaders" },
              ]}
            />
            <FooterCol
              title="For staff"
              links={[
                { href: "/statistician", label: "Statistician Upload" },
              ]}
            />
            <FooterCol
              title="Source"
              links={[
                { href: "https://courtside-live.onrender.com", label: "Courtside Live", external: true },
              ]}
            />
          </div>
        </div>

        <div className="section-rule mt-12" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Courtside. Sample data for demonstration.</p>
          <p>Built with Next.js · Data adapter ready for the Courtside Live API.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="eyebrow mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            ) : (
              <Link
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
