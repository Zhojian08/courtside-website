"use client";

import { useState } from "react";
import { WexmeLogo } from "./WexmeLogo";

/**
 * Renders the real WeXmE logo from /public/wexme-mark.png.
 * Falls back to the text wordmark if the image is missing, so the
 * header/footer never show a broken image.
 */
export function BrandLogo({
  src = "/wexme-mark.png",
  imgClassName,
  fallbackClassName,
}: {
  src?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <WexmeLogo className={fallbackClassName} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="WeXmE"
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}
