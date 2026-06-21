export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}

export function formatDateLong(iso: string): string {
  return formatDate(iso, { weekday: "long", year: "numeric", month: "long" });
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function pct3(n: number): string {
  // .478 style
  return n.toFixed(3).replace(/^0/, "");
}
