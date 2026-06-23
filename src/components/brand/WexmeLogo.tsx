import { clsx } from "clsx";

/**
 * WeXmE wordmark — metallic silver letters with an electric-blue lightning "X".
 * Scales with font-size (set via `className`, e.g. `text-2xl`).
 *
 * To use the exact uploaded PNG instead, drop it at `public/wexme-logo.png`
 * and swap this component for <img src="/wexme-logo.png" alt="WeXmE" />.
 */
export function WexmeLogo({
  className,
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={clsx("inline-flex flex-col leading-none", className)}>
      <span className="wexme-wordmark">
        <span className="wexme-metal">We</span>
        <span className="wexme-blade">X</span>
        <span className="wexme-metal">mE</span>
      </span>
      {withTagline && <span className="wexme-tagline">United Arab Emirates</span>}
    </span>
  );
}
