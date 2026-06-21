export function BallMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="ball-g" x1="6" y1="6" x2="42" y2="42">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ff6a1a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#ball-g)" />
      <g stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <path d="M24 4v40" />
        <path d="M4 24h40" />
        <path d="M9 9c8 6 8 24 0 30" />
        <path d="M39 9c-8 6-8 24 0 30" />
      </g>
      <circle cx="24" cy="24" r="20" stroke="#0a0a0a" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
