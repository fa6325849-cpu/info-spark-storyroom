import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSidebarData } from "@/lib/news.functions";
import { AdSlot } from "./AdSlot";
import { imageUrl } from "@/lib/format";

export function Sidebar() {
  const { data } = useQuery({ queryKey: ["sidebar"], queryFn: () => getSidebarData(), staleTime: 60_000 });
  return (
    <aside className="space-y-8" aria-label="Sidebar">
      <AdSlot size="rectangle" />
      <section>
        <h2 className="section-title mb-4 text-xl">Trending Now</h2>
        <ol className="space-y-4">
          {(data?.trending ?? []).map((a, i) => (
            <li key={a.id} className="flex gap-3">
              <span className="font-display text-3xl font-black leading-none text-spark/80">{i + 1}</span>
              <div className="flex-1">
                <Link to="/news/$slug" params={{ slug: a.slug }} className="font-display font-bold leading-snug hover:text-spark">{a.title}</Link>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{a.category?.name}</p>
              </div>
              <img src={imageUrl(a.cover_image, 160)} alt="" loading="lazy" className="h-14 w-16 rounded-sm object-cover" />
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="section-title mb-4 text-xl">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {(data?.tags ?? []).map((t) => (
            <Link key={t} to="/search" search={{ q: t, page: 1 }} className="rounded-sm border px-2.5 py-1 text-xs font-semibold hover:border-spark hover:text-spark">#{t}</Link>
          ))}
        </div>
      </section>
      <div className="sticky top-20"><AdSlot size="rectangle" /></div>
    </aside>
  );
}
