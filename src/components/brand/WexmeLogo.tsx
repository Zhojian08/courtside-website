import { clsx } from "clsx";

/**
 * WeXmE wordmark — metallic silver letters with an electric-blue lightning "X".
 * Used only as a fallback if the logo image fails to load.
 */
export function WexmeLogo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex flex-col leading-none", className)}>
      <span className="wexme-wordmark">
        <span className="wexme-metal">We</span>
        <span className="wexme-blade">X</span>
        <span className="wexme-metal">mE</span>
      </span>
    </span>
  );
}
