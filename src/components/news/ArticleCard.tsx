import { Link } from "@tanstack/react-router";
import type { ArticleListItem } from "@/lib/news.functions";
import { imageUrl, timeAgo } from "@/lib/format";

export function CategoryTag({ a, light = false }: { a: ArticleListItem; light?: boolean }) {
  if (!a.category) return null;
  return (
    <Link
      to="/category/$slug"
      params={{ slug: a.category.slug }}
      className={`text-[11px] font-bold uppercase tracking-[0.15em] ${light ? "text-navy-foreground" : "text-spark"} hover:underline`}
    >
      {a.category.name}
    </Link>
  );
}

export function DemoBadge({ a }: { a: { is_demo: boolean } }) {
  if (!a.is_demo) return null;
  return <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Demo</span>;
}

export function ArticleCard({ a, variant = "default" }: { a: ArticleListItem; variant?: "default" | "compact" | "horizontal" }) {
  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <Link to="/news/$slug" params={{ slug: a.slug }} className="img-zoom block h-16 w-20 shrink-0 rounded-sm">
          <img src={imageUrl(a.cover_image, 200)} alt={a.image_alt || a.title} loading="lazy" className="h-full w-full object-cover" />
        </Link>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-bold leading-snug">
            <Link to="/news/$slug" params={{ slug: a.slug }} className="hover:text-spark">{a.title}</Link>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.published_at)}</p>
        </div>
      </article>
    );
  }
  if (variant === "horizontal") {
    return (
      <article className="group grid gap-4 border-b pb-5 sm:grid-cols-[220px_1fr]">
        <Link to="/news/$slug" params={{ slug: a.slug }} className="img-zoom block aspect-[16/10] rounded-sm">
          <img src={imageUrl(a.cover_image, 500)} alt={a.image_alt || a.title} loading="lazy" className="h-full w-full object-cover" />
        </Link>
        <div>
          <div className="flex items-center gap-2"><CategoryTag a={a} /><DemoBadge a={a} /></div>
          <h3 className="mt-1 font-display text-xl font-bold leading-snug">
            <Link to="/news/$slug" params={{ slug: a.slug }} className="hover:text-spark">{a.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
          <p className="mt-2 text-xs text-muted-foreground">{a.author_name} · {timeAgo(a.published_at)}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="group animate-fade-up">
      <Link to="/news/$slug" params={{ slug: a.slug }} className="img-zoom block aspect-[16/10] rounded-sm bg-muted">
        <img src={imageUrl(a.cover_image, 640)} alt={a.image_alt || a.title} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <div className="mt-3 flex items-center gap-2"><CategoryTag a={a} /><DemoBadge a={a} /></div>
      <h3 className="mt-1 font-display text-lg font-bold leading-snug">
        <Link to="/news/$slug" params={{ slug: a.slug }} className="hover:text-spark">{a.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
      <p className="mt-2 text-xs text-muted-foreground">{a.author_name} · {timeAgo(a.published_at)}</p>
    </article>
  );
}
