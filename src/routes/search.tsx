import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { searchArticles, PAGE_SIZE } from "@/lib/news.functions";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Pager } from "@/components/news/Pager";
import { Breadcrumbs } from "@/components/news/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().catch("").default(""),
    category: z.string().optional().catch(undefined),
    page: z.coerce.number().int().min(1).catch(1).default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => searchArticles({ data: { q: deps.q, category: deps.category, page: deps.page } }),
  head: () => ({
    meta: [
      { title: `Search news | ${SITE.name}` },
      { name: "description", content: `Search every story on ${SITE.name} by title, keyword or topic.` },
      { property: "og:title", content: `Search | ${SITE.name}` },
      { property: "og:description", content: `Search stories on ${SITE.name}.` },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { articles, total } = Route.useLoaderData();
  const search = Route.useSearch();
  const categories = RootRoute.useLoaderData() ?? [];
  const navigate = useNavigate({ from: "/search" });
  const [q, setQ] = useState(search.q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="mt-4 text-4xl font-black">Search</h1>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row" role="search"
        onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: q.trim(), category: search.category, page: 1 } }); }}>
        <label htmlFor="s-q" className="sr-only">Keywords</label>
        <input id="s-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or keyword…" className="h-12 flex-1 rounded-sm border px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring" />
        <label htmlFor="s-cat" className="sr-only">Category</label>
        <select id="s-cat" value={search.category ?? ""} onChange={(e) => navigate({ search: { q: search.q, category: e.target.value || undefined, page: 1 } })} className="h-12 rounded-sm border bg-background px-3">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <Button type="submit" variant="spark" className="h-12 px-8">Search</Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground" role="status">
        {total} result{total === 1 ? "" : "s"}{search.q ? <> for “<strong className="text-foreground">{search.q}</strong>”</> : ""}
      </p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {articles.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>
      {articles.length === 0 && <p className="py-16 text-center text-muted-foreground">No stories matched. Try another keyword.</p>}
      <Pager page={search.page} total={total} pageSize={PAGE_SIZE} linkProps={(p) => ({ to: "/search", search: { ...search, page: p } })} />
    </div>
  );
}
