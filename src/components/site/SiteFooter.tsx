import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex" aria-label="WeXmE home">
              <BrandLogo imgClassName="h-20 w-auto" fallbackClassName="text-3xl" withTagline />
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Pro-grade coverage for UAE amateur basketball — box scores, standings,
              leaderboards and game-night stories.
            </p>
          </div>

          <div className="flex gap-10">
            <FooterCol
              title="Explore"
              links={[
                { href: "/games", label: "Games" },
                { href: "/standings", label: "Standings" },
                { href: "/leaders", label: "Leaders" },
              ]}
            />
          </div>
        </div>

        <div className="section-rule mt-12" />
        <div className="mt-6 text-xs text-faint">
          <p>© {new Date().getFullYear()} WeXmE · United Arab Emirates.</p>
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
