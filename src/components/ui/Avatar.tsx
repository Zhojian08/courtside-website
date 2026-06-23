import { clsx } from "clsx";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function Avatar({
  name,
  src,
  className,
  rounded = "rounded-2xl",
  align = "center",
  initialsClassName,
}: {
  name: string;
  src?: string | null;
  className?: string;
  rounded?: string;
  align?: "center" | "top";
  initialsClassName?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={clsx("object-cover", rounded, className)}
      />
    );
  }
  const hue = hueFromName(name);
  return (
    <div
      className={clsx(
        "flex justify-center font-display text-fg/90 select-none",
        align === "top" ? "items-start" : "items-center",
        rounded,
        className
      )}
      style={{
        containerType: "inline-size",
        background: `radial-gradient(120% 120% at 30% 20%, hsl(${hue} 55% 32%), hsl(${(hue + 40) % 360} 60% 14%))`,
      }}
      aria-label={name}
    >
      <span
        className={clsx(
          initialsClassName ?? "text-[clamp(0.9rem,42cqw,3rem)]",
          align === "top" && "mt-[16cqw]"
        )}
      >
        {initials(name)}
      </span>
    </div>
  );
}
