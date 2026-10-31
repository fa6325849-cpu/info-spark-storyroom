import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AdSlot } from "./AdSlot";
import { SITE, STATIC_PAGES } from "@/lib/site";
import type { Category } from "@/lib/news.functions";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-6"><AdSlot size="leaderboard" /></div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo inverted />
          <p className="mt-4 text-sm text-navy-foreground/75">{SITE.tagline}</p>
          <p className="mt-2 text-sm text-navy-foreground/60">Independent digital news covering the world, Pakistan and everything in between.</p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-spark">Sections</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} className="text-navy-foreground/80 hover:text-navy-foreground">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-spark">Company</h2>
          <ul className="space-y-1.5 text-sm">
            {STATIC_PAGES.map((p) => (
              <li key={p.to}><Link to={p.to} className="text-navy-foreground/80 hover:text-navy-foreground">{p.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-spark">Follow us</h2>
          <ul className="space-y-1.5 text-sm">
            {Object.entries(SITE.social).map(([k, v]) => (
              <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="capitalize text-navy-foreground/80 hover:text-navy-foreground">{k === "x" ? "X (Twitter)" : k}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-soft">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-5 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved. Sample articles are labelled as demonstration content.</p>
          <Link to="/auth" className="hover:text-navy-foreground">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}
