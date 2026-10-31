import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const LIST_FIELDS =
  "id,slug,title,excerpt,cover_image,image_alt,author_name,published_at,tags,is_featured,is_editors_pick,is_breaking,is_demo,views,category:categories(slug,name)";

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  image_alt: string;
  author_name: string;
  published_at: string | null;
  tags: string[];
  is_featured: boolean;
  is_editors_pick: boolean;
  is_breaking: boolean;
  is_demo: boolean;
  views: number;
  category: { slug: string; name: string } | null;
};
export type FullArticle = ArticleListItem & {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
};
export type Category = { id: string; slug: string; name: string; description: string; sort_order: number };

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const live = () => new Date().toISOString();

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data as Category[];
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [arts, cats, popular] = await Promise.all([
    sb.from("articles").select(LIST_FIELDS).lte("published_at", live()).order("published_at", { ascending: false }).limit(60),
    sb.from("categories").select("*").order("sort_order"),
    sb.from("articles").select(LIST_FIELDS).lte("published_at", live()).order("views", { ascending: false }).limit(6),
  ]);
  if (arts.error) throw new Error(arts.error.message);
  return {
    articles: (arts.data ?? []) as unknown as ArticleListItem[],
    categories: (cats.data ?? []) as Category[],
    popular: (popular.data ?? []) as unknown as ArticleListItem[],
  };
});

export const getSidebarData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("articles").select(LIST_FIELDS).lte("published_at", live()).order("views", { ascending: false }).limit(30);
  const items = (data ?? []) as unknown as ArticleListItem[];
  const tagCount = new Map<string, number>();
  items.forEach((a) => a.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1)));
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([t]) => t);
  return { trending: items.slice(0, 5), tags };
});

export const PAGE_SIZE = 9;

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; page: number }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: cat } = await sb.from("categories").select("*").eq("slug", data.slug).maybeSingle();
    if (!cat) return { category: null, articles: [], total: 0 };
    const from = (data.page - 1) * PAGE_SIZE;
    const { data: arts, count } = await sb
      .from("articles")
      .select(LIST_FIELDS, { count: "exact" })
      .eq("category_id", cat.id)
      .lte("published_at", live())
      .order("published_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    return { category: cat as Category, articles: (arts ?? []) as unknown as ArticleListItem[], total: count ?? 0 };
  });

export const searchArticles = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; category?: string | undefined; page: number }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const q = data.q.trim().slice(0, 100).replace(/[%,()*]/g, " ");
    let query = sb.from("articles").select(LIST_FIELDS + ",categories!inner(slug)", { count: "exact" }).lte("published_at", live());
    if (q) {
      const words = q.split(/\s+/).filter(Boolean).slice(0, 5);
      const orParts = [`title.ilike.%${q}%`, `excerpt.ilike.%${q}%`, `content.ilike.%${q}%`, ...words.map((w) => `tags.cs.{${w.toLowerCase()}}`)];
      query = query.or(orParts.join(","));
    }
    if (data.category) query = query.eq("categories.slug", data.category);
    const from = (data.page - 1) * PAGE_SIZE;
    const { data: rows, count, error } = await query.order("published_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return { articles: (rows ?? []) as unknown as ArticleListItem[], total: count ?? 0 };
  });

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: art } = await sb
      .from("articles")
      .select(LIST_FIELDS + ",content,meta_title,meta_description,updated_at,category_id")
      .eq("slug", data.slug)
      .lte("published_at", live())
      .maybeSingle();
    if (!art) return null;
    const a = art as unknown as FullArticle & { category_id: string | null };
    const [related, prev, next, comments] = await Promise.all([
      sb.from("articles").select(LIST_FIELDS).eq("category_id", a.category_id ?? "").neq("id", a.id).lte("published_at", live()).order("published_at", { ascending: false }).limit(3),
      sb.from("articles").select("slug,title").lt("published_at", a.published_at!).order("published_at", { ascending: false }).limit(1).maybeSingle(),
      sb.from("articles").select("slug,title").gt("published_at", a.published_at!).lte("published_at", live()).order("published_at", { ascending: true }).limit(1).maybeSingle(),
      sb.from("comments").select("id,author_name,body,created_at").eq("article_id", a.id).order("created_at", { ascending: false }),
    ]);
    return {
      article: a,
      related: (related.data ?? []) as unknown as ArticleListItem[],
      prev: prev.data as { slug: string; title: string } | null,
      next: next.data as { slug: string; title: string } | null,
      comments: comments.data ?? [],
    };
  });

export const getSitemapEntries = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [arts, cats] = await Promise.all([
    sb.from("articles").select("slug,updated_at").lte("published_at", live()).order("published_at", { ascending: false }).limit(5000),
    sb.from("categories").select("slug"),
  ]);
  return { articles: arts.data ?? [], categories: cats.data ?? [] };
});
