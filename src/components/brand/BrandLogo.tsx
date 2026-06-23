"use client";

import { useState } from "react";
import { WexmeLogo } from "./WexmeLogo";

/**
 * Renders the real WeXmE logo from /public/wexme-logo.png.
 * If that file is missing it falls back to the text wordmark, so the
 * header/footer never show a broken image.
 *
 * Drop the exact logo at `public/wexme-logo.png` to use it everywhere.
 */
export function BrandLogo({
  src = "/wexme-logo.png",
  imgClassName,
  fallbackClassName,
  withTagline = false,
}: {
  src?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  withTagline?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <WexmeLogo className={fallbackClassName} withTagline={withTagline} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="WeXmE — United Arab Emirates"
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}
