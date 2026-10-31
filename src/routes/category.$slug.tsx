import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getCategoryPage, PAGE_SIZE } from "@/lib/news.functions";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/news/Breadcrumbs";
import { Pager } from "@/components/news/Pager";
import { AdSlot } from "@/components/news/AdSlot";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: z.object({ page: z.coerce.number().int().min(1).catch(1).default(1) }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    const res = await getCategoryPage({ data: { slug: params.slug, page: deps.page } });
    if (!res.category) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.category;
    const title = c ? `${c.name} — Latest ${c.name} Headlines | ${SITE.name}` : `Section unavailable | ${SITE.name}`;
    const desc = c ? `${c.description} Read the latest ${c.name.toLowerCase()} stories on ${SITE.name}.` : SITE.description;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        ...(c ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
      scripts: c ? [{ type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: c.name, path: `/category/${c.slug}` }])) }] : [],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, articles, total } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const { slug } = Route.useParams();
  if (!category) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: category.name }]} />
      <header className="mt-4 border-b-4 border-navy pb-5">
        <h1 className="text-4xl font-black sm:text-5xl">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
      </header>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {articles.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No stories in this section yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {articles.map((a, i) => (
                <div key={a.id} className={i === 0 && page === 1 ? "sm:col-span-2 md:col-span-3" : ""}>
                  {i === 0 && page === 1 ? <ArticleCard a={a} variant="horizontal" /> : <ArticleCard a={a} />}
                </div>
              ))}
            </div>
          )}
          <AdSlot size="banner" />
          <Pager page={page} total={total} pageSize={PAGE_SIZE} linkProps={(p) => ({ to: "/category/$slug", params: { slug }, search: { page: p } })} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
