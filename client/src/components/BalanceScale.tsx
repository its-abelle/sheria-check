export function BalanceScale({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="Scales of justice balancing">
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full animate-scales-balance"
        style={{ transformOrigin: "center 16px" }}
        aria-hidden="true"
      >
        <g className="animate-scales-glow">
          <line x1="60" y1="4" x2="60" y2="16" stroke="#D49566" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="16" x2="116" y2="16" stroke="#D49566" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="60" y1="16" x2="60" y2="28" stroke="#C59B7E" strokeWidth="1.5" />
          <circle cx="60" cy="16" r="3.5" stroke="#C59B7E" strokeWidth="1.5" fill="#6B3A2A" />
          <line x1="60" y1="16" x2="16" y2="52" stroke="#D49566" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="16" x2="104" y2="52" stroke="#D49566" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M8 52 Q16 40 24 52"
            stroke="#C59B7E"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M96 52 Q104 40 112 52"
            stroke="#C59B7E"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="12" y1="52" x2="20" y2="52" stroke="#C59B7E" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="52" x2="108" y2="52" stroke="#C59B7E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="58" r="2" fill="#FBBF24" opacity="0.8" />
          <circle cx="104" cy="58" r="2" fill="#FBBF24" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
