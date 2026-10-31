import { Link } from "@tanstack/react-router";
import type { ArticleListItem } from "@/lib/news.functions";

export function BreakingTicker({ items }: { items: ArticleListItem[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="border-b bg-background" role="region" aria-label="Breaking news">
      <div className="mx-auto flex max-w-7xl items-stretch overflow-hidden px-4">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-spark px-3 py-2 text-xs font-black uppercase tracking-widest text-spark-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-spark-foreground" /> Breaking
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-ticker flex w-max gap-10 whitespace-nowrap py-2 pl-6">
            {loop.map((a, i) => (
              <Link key={a.id + i} to="/news/$slug" params={{ slug: a.slug }} className="text-sm font-semibold hover:text-spark">
                <span className="mr-2 text-spark">●</span>{a.title}{a.is_demo ? " (demo)" : ""}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
