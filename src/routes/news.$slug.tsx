import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { getArticle } from "@/lib/news.functions";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/news/Breadcrumbs";
import { ShareButtons } from "@/components/news/ShareButtons";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";
import { AdSlot } from "@/components/news/AdSlot";
import { extractHeadings, formatDate, headingId, imageUrl, readingTime } from "@/lib/format";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const res = await getArticle({ data: { slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: `Story unavailable | ${SITE.name}` }, { name: "robots", content: "noindex" }] };
    const title = a.meta_title || a.title;
    const desc = a.meta_description || a.excerpt;
    const img = a.cover_image ? imageUrl(a.cover_image, 1200) : undefined;
    const path = `/news/${params.slug}`;
    return {
      meta: [
        { title: `${title} | ${SITE.name}` },
        { name: "description", content: desc },
        { name: "author", content: a.author_name },
        { name: "keywords", content: a.tags.join(", ") },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: path },
        { property: "article:published_time", content: a.published_at ?? "" },
        { property: "article:modified_time", content: a.updated_at },
        { property: "article:section", content: a.category?.name ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }, { property: "og:image:alt", content: a.image_alt || a.title }] : []),
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: a.title,
            description: desc,
            image: img ? [img] : undefined,
            datePublished: a.published_at,
            dateModified: a.updated_at,
            author: [{ "@type": "Person", name: a.author_name }],
            publisher: { "@type": "NewsMediaOrganization", name: SITE.name },
            articleSection: a.category?.name,
            keywords: a.tags.join(", "),
            mainEntityOfPage: path,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", path: "/" },
            ...(a.category ? [{ name: a.category.name, path: `/category/${a.category.slug}` }] : []),
            { name: a.title, path },
          ])),
        },
      ],
    };
  },
  component: ArticlePage,
});

function textOf(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) return textOf((children as { props: { children?: ReactNode } }).props.children);
  return "";
}

const mdComponents = {
  h2: ({ children }: { children?: ReactNode }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 id={headingId(textOf(children))}>{children}</h3>,
  img: (p: { src?: string | undefined; alt?: string | undefined }) => <img src={p.src} alt={p.alt ?? ""} loading="lazy" />,
  a: (p: { href?: string | undefined; children?: ReactNode }) => <a href={p.href} target={p.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{p.children}</a>,
};

function splitForAd(md: string) {
  const parts = md.split(/\n(?=## )/);
  if (parts.length < 3) return [md, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join("\n"), parts.slice(mid).join("\n")];
}

function ArticlePage() {
  const { article: a, related, prev, next, comments } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const headings = extractHeadings(a.content);
  const minutes = readingTime(a.content);
  const [first, second] = splitForAd(a.content);

  useEffect(() => {
    supabase.rpc("increment_article_view", { _slug: slug });
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[...(a.category ? [{ label: a.category.name, to: "/category/$slug", params: { slug: a.category.slug } }] : []), { label: a.title }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <header>
            {a.category && (
              <Link to="/category/$slug" params={{ slug: a.category.slug }} className="text-xs font-black uppercase tracking-[0.2em] text-spark">{a.category.name}</Link>
            )}
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{a.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{a.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y py-3 text-sm">
              <span>By <strong className="text-navy">{a.author_name}</strong></span>
              <time dateTime={a.published_at ?? ""} className="text-muted-foreground">{formatDate(a.published_at, true)}</time>
              <span className="text-muted-foreground">{minutes} min read</span>
              <span className="text-muted-foreground">{a.views.toLocaleString()} views</span>
            </div>
          </header>

          {a.is_demo && (
            <div role="note" className="mt-5 rounded-sm border-l-4 border-spark bg-accent px-4 py-3 text-sm text-accent-foreground">
              <strong>Demonstration content.</strong> This sample article was written to showcase the site. People, quotes and events are illustrative — it is not a real news report.
            </div>
          )}

          <figure className="mt-6">
            <img src={imageUrl(a.cover_image, 1400)} alt={a.image_alt || a.title} className="aspect-[16/9] w-full rounded-sm object-cover" fetchPriority="high" />
            {a.image_alt && <figcaption className="mt-2 text-xs text-muted-foreground">{a.image_alt}</figcaption>}
          </figure>

          <div className="mt-6"><ShareButtons title={a.title} path={`/news/${slug}`} /></div>

          {headings.length >= 3 && (
            <nav aria-labelledby="toc-h" className="mt-8 rounded-sm border bg-secondary p-5">
              <h2 id="toc-h" className="font-sans text-xs font-black uppercase tracking-[0.2em] text-navy">In this article</h2>
              <ol className="mt-3 space-y-1.5 text-sm">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                    <a href={`#${h.id}`} className="hover:text-spark">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="prose-news mt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{first}</ReactMarkdown>
            {second && <AdSlot size="inarticle" />}
            {second && <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{second}</ReactMarkdown>}
          </div>

          {a.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {a.tags.map((t) => <Link key={t} to="/search" search={{ q: t, page: 1 }} className="rounded-sm border px-2.5 py-1 text-xs font-semibold hover:border-spark hover:text-spark">#{t}</Link>)}
            </div>
          )}
          <div className="mt-6 border-t pt-6"><ShareButtons title={a.title} path={`/news/${slug}`} /></div>

          <nav aria-label="More articles" className="mt-8 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link to="/news/$slug" params={{ slug: prev.slug }} className="rounded-sm border p-4 hover:border-spark">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">← Previous</span>
                <span className="mt-1 block font-display font-bold">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to="/news/$slug" params={{ slug: next.slug }} className="rounded-sm border p-4 text-right hover:border-spark">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Next →</span>
                <span className="mt-1 block font-display font-bold">{next.title}</span>
              </Link>
            )}
          </nav>

          {related.length > 0 && (
            <section className="mt-12" aria-labelledby="rel-h">
              <h2 id="rel-h" className="section-title mb-5">Related Articles</h2>
              <div className="grid gap-6 sm:grid-cols-3">{related.map((r) => <ArticleCard key={r.id} a={r} />)}</div>
            </section>
          )}

          <Comments articleId={a.id} comments={comments} />
        </article>
        <Sidebar />
      </div>
    </div>
  );
}

const commentSchema = z.object({
  author_name: z.string().trim().min(1, "Please enter your name").max(80),
  body: z.string().trim().min(2, "Comment is too short").max(2000),
});

function Comments({ articleId, comments }: { articleId: string; comments: { id: string; author_name: string; body: string; created_at: string }[] }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = commentSchema.safeParse({ author_name: name, body });
    if (!parsed.success) return setMsg({ ok: false, text: parsed.error.issues[0]?.message ?? "Invalid input" });
    setBusy(true);
    const { error } = await supabase.from("comments").insert({ article_id: articleId, author_name: parsed.data.author_name, body: parsed.data.body });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Could not post your comment. Please try again." });
    setName(""); setBody("");
    setMsg({ ok: true, text: "Thanks! Your comment was received and will appear once a moderator approves it." });
  }

  return (
    <section className="mt-14 border-t-4 border-navy pt-6" aria-labelledby="com-h">
      <h2 id="com-h" className="section-title">Comments ({comments.length})</h2>
      <form onSubmit={submit} className="mt-5 space-y-3 rounded-sm border p-5">
        <label htmlFor="c-name" className="block text-sm font-semibold">Name</label>
        <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
        <label htmlFor="c-body" className="block text-sm font-semibold">Your comment</label>
        <Textarea id="c-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} required />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Comments are moderated. Please be respectful.</p>
          <Button type="submit" variant="spark" disabled={busy}>{busy ? "Posting…" : "Post comment"}</Button>
        </div>
        {msg && <p role="status" className={`text-sm ${msg.ok ? "text-navy" : "text-spark"}`}>{msg.text}</p>}
      </form>
      <ul className="mt-6 space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="border-b pb-4">
            <p className="text-sm"><strong>{c.author_name}</strong> <span className="text-muted-foreground">· {formatDate(c.created_at)}</span></p>
            <p className="mt-1 whitespace-pre-line text-[15px]">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-muted-foreground">Be the first to comment.</li>}
      </ul>
    </section>
  );
}
