import { Link } from "@tanstack/react-router";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Info Spark's — home">
      <span className="relative grid h-10 w-10 place-items-center rounded-sm bg-spark text-spark-foreground shadow-card">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-2xl font-black tracking-tight sm:text-3xl ${inverted ? "text-navy-foreground" : "text-navy"}`}>
          Info <span className="text-spark">Spark's</span>
        </span>
        <span className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.25em] sm:block ${inverted ? "text-navy-foreground/70" : "text-muted-foreground"}`}>
          News · Analysis · Insight
        </span>
      </span>
    </Link>
  );
}
