import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { AdSlot } from "./AdSlot";
import { SITE } from "@/lib/site";
import type { Category } from "@/lib/news.functions";

export function SiteHeader({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/search", search: { q: q.trim(), page: 1 } });
  }

  return (
    <header className="bg-background">
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <span suppressHydrationWarning>{today}</span>
          <span className="hidden italic text-navy-foreground/80 md:block">{SITE.tagline}</span>
          <div className="flex gap-3">
            <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-spark">Facebook</a>
            <a href={SITE.social.x} target="_blank" rel="noopener noreferrer" className="hover:text-spark">X</a>
            <a href={SITE.social.telegram} target="_blank" rel="noopener noreferrer" className="hidden hover:text-spark sm:inline">Telegram</a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5">
        <Logo />
        <div className="hidden flex-1 lg:block"><AdSlot size="leaderboard" /></div>
        <button className="rounded-sm p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <nav aria-label="Main" className="sticky top-0 z-40 border-y-2 border-navy bg-background/95 backdrop-blur">
        <div className="mx-auto hidden max-w-7xl items-center gap-1 px-4 lg:flex">
          <Link to="/" className="px-2.5 py-3 text-[13px] font-bold uppercase tracking-wide hover:text-spark" activeOptions={{ exact: true }} activeProps={{ className: "text-spark" }}>Home</Link>
          {categories.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="whitespace-nowrap px-2 py-3 text-[13px] font-bold uppercase tracking-wide hover:text-spark" activeProps={{ className: "text-spark" }}>
              {c.name.replace(" News", "")}
            </Link>
          ))}
          <form onSubmit={submit} className="ml-auto flex items-center" role="search">
            <label htmlFor="hdr-search" className="sr-only">Search news</label>
            <input id="hdr-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 w-32 rounded-sm border bg-background px-2 text-sm focus:w-48 focus:outline-none focus:ring-1 focus:ring-ring transition-all" />
            <button type="submit" aria-label="Search" className="ml-1 rounded-sm p-1.5 hover:text-spark"><Search className="h-4 w-4" /></button>
          </form>
        </div>
        {open && (
          <div className="border-t px-4 pb-4 lg:hidden animate-fade-up">
            <form onSubmit={submit} className="flex gap-2 py-3" role="search">
              <label htmlFor="m-search" className="sr-only">Search news</label>
              <input id="m-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" className="h-10 flex-1 rounded-sm border px-3" />
              <button type="submit" className="rounded-sm bg-spark px-4 text-sm font-semibold text-spark-foreground">Go</button>
            </form>
            <div className="grid grid-cols-2 gap-1">
              <Link to="/" onClick={() => setOpen(false)} className="py-2 font-semibold">Home</Link>
              {categories.map((c) => (
                <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="py-2 font-semibold">{c.name}</Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-1 overflow-x-auto px-4 lg:hidden [scrollbar-width:none]">
          {!open && categories.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="whitespace-nowrap px-2 py-2.5 text-xs font-bold uppercase" activeProps={{ className: "text-spark" }}>{c.name.replace(" News", "")}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
