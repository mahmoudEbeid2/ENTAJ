export function EmptyProductsState({ message = "Products coming soon." }: { message?: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 py-12 text-center">
      <div className="relative flex size-28 items-center justify-center sm:size-32">
        <span
          className="animate-pulse-ring absolute inset-0 rounded-full bg-gradient-entaj"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
          className="animate-float-soft relative size-16 sm:size-20"
        >
          <defs>
            <linearGradient id="emptyProductsGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E3B90" />
              <stop offset="1" stopColor="#72A9D1" />
            </linearGradient>
          </defs>
          <path
            d="M20 45 L14 24 L50 30 L50 45"
            stroke="url(#emptyProductsGradient)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M80 45 L86 24 L50 30"
            stroke="url(#emptyProductsGradient)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect
            x="20"
            y="45"
            width="60"
            height="38"
            rx="4"
            stroke="url(#emptyProductsGradient)"
            strokeWidth="3.5"
          />
          <line x1="20" y1="45" x2="80" y2="45" stroke="url(#emptyProductsGradient)" strokeWidth="3.5" />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-expanded text-lg text-entaj-dark-grey">{message}</p>
        <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
          <span className="animate-bounce-dot size-1.5 rounded-full bg-entaj-blue" style={{ animationDelay: "0ms" }} />
          <span className="animate-bounce-dot size-1.5 rounded-full bg-entaj-blue" style={{ animationDelay: "150ms" }} />
          <span className="animate-bounce-dot size-1.5 rounded-full bg-entaj-blue" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
