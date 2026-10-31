import { createFileRoute, Link } from "@tanstack/react-router";
import { getHomeData, type ArticleListItem } from "@/lib/news.functions";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { ArticleCard, CategoryTag, DemoBadge } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";
import { AdSlot } from "@/components/news/AdSlot";
import { Newsletter } from "@/components/news/Newsletter";
import { imageUrl, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: `${SITE.name} — Latest World, Pakistan, Tech & Business News` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Hero({ a }: { a: ArticleListItem }) {
  return (
    <article className="group relative overflow-hidden rounded-sm img-zoom">
      <img src={imageUrl(a.cover_image, 1400)} alt={a.image_alt || a.title} className="aspect-[16/11] h-full w-full object-cover lg:aspect-auto lg:min-h-[480px]" fetchPriority="high" />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-navy-foreground sm:p-8">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-spark px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-spark-foreground">Featured</span>
          <CategoryTag a={a} light /> <DemoBadge a={a} />
        </div>
        <h1 className="mt-3 max-w-3xl text-2xl font-black leading-tight sm:text-4xl">
          <Link to="/news/$slug" params={{ slug: a.slug }} className="hover:underline decoration-spark decoration-2 underline-offset-4">{a.title}</Link>
        </h1>
        <p className="mt-2 hidden max-w-2xl text-navy-foreground/85 sm:block">{a.excerpt}</p>
        <p className="mt-3 text-xs text-navy-foreground/70">{a.author_name} · {timeAgo(a.published_at)}</p>
      </div>
    </article>
  );
}

function Home() {
  const { articles, categories, popular } = Route.useLoaderData();
  const featured = articles.filter((a) => a.is_featured);
  const hero = featured[0] ?? articles[0];
  const sideFeatured = (featured.length > 1 ? featured.slice(1, 5) : articles.slice(1, 5)).filter((a) => a.id !== hero?.id);
  const breaking = articles.filter((a) => a.is_breaking).slice(0, 8);
  const shown = new Set([hero?.id, ...sideFeatured.map((a) => a.id)]);
  const latest = articles.filter((a) => !shown.has(a.id)).slice(0, 6);
  const picks = articles.filter((a) => a.is_editors_pick).slice(0, 4);
  const cutoff = Date.now() - 1000 * 60 * 60 * 72;
  const trending = [...articles].filter((a) => new Date(a.published_at ?? 0).getTime() > cutoff).sort((a, b) => b.views - a.views).slice(0, 4);

  if (!hero) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">No stories published yet.</div>;
  }

  return (
    <>
      <BreakingTicker items={breaking.length ? breaking : articles.slice(0, 6)} />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <p className="mb-4 rounded-sm border-l-4 border-spark bg-accent px-3 py-2 text-xs text-accent-foreground">
          Articles marked <strong>Demo</strong> are sample demonstration content and are not real news reports.
        </p>
        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]" aria-label="Featured stories">
          <Hero a={hero} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {sideFeatured.map((a) => <ArticleCard key={a.id} a={a} variant="compact" />)}
          </div>
        </section>

        {trending.length > 0 && (
          <section className="mt-10" aria-labelledby="trending-h">
            <h2 id="trending-h" className="section-title mb-5">Trending</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trending.map((a) => <ArticleCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        <AdSlot size="banner" />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="latest-h">
              <h2 id="latest-h" className="section-title mb-5">Latest News</h2>
              <div className="grid gap-7 sm:grid-cols-2 md:grid-cols-3">
                {latest.map((a) => <ArticleCard key={a.id} a={a} />)}
              </div>
            </section>

            {picks.length > 0 && (
              <section aria-labelledby="picks-h" className="rounded-sm bg-secondary p-5 sm:p-7">
                <h2 id="picks-h" className="section-title mb-5">Editor's Picks</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {picks.map((a) => <ArticleCard key={a.id} a={a} variant="horizontal" />)}
                </div>
              </section>
            )}

            <section aria-labelledby="popular-h">
              <h2 id="popular-h" className="section-title mb-5">Most Popular</h2>
              <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {popular.map((a, i) => (
                  <li key={a.id} className="flex gap-4 border-b pb-4">
                    <span className="font-display text-4xl font-black text-navy/20">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <CategoryTag a={a} />
                      <Link to="/news/$slug" params={{ slug: a.slug }} className="mt-0.5 block font-display text-lg font-bold leading-snug hover:text-spark">{a.title}</Link>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {categories.map((c, idx) => {
              const items = articles.filter((a) => a.category?.slug === c.slug).slice(0, 3);
              if (!items.length) return null;
              return (
                <section key={c.id} aria-labelledby={`cat-${c.slug}`}>
                  <div className="mb-5 flex items-end justify-between border-b pb-2">
                    <h2 id={`cat-${c.slug}`} className="section-title">{c.name}</h2>
                    <Link to="/category/$slug" params={{ slug: c.slug }} className="text-xs font-bold uppercase tracking-wider text-spark hover:underline">View all →</Link>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <ArticleCard a={items[0]!} />
                    <div className="space-y-5">{items.slice(1).map((a) => <ArticleCard key={a.id} a={a} variant="compact" />)}</div>
                  </div>
                  {idx === 3 && <AdSlot size="banner" />}
                </section>
              );
            })}
          </div>
          <Sidebar />
        </div>
      </div>
      <Newsletter />
    </>
  );
}
