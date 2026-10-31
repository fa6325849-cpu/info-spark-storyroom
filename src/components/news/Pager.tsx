import { Link } from "@tanstack/react-router";

export function Pager({ page, total, pageSize, linkProps }: {
  page: number;
  total: number;
  pageSize: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkProps: (p: number) => any;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && <Link {...linkProps(page - 1)} className="rounded-sm border px-3 py-2 text-sm font-semibold hover:border-spark">← Prev</Link>}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link key={p} {...linkProps(p)} aria-current={p === page ? "page" : undefined}
          className={`rounded-sm border px-3 py-2 text-sm font-semibold ${p === page ? "border-navy bg-navy text-navy-foreground" : "hover:border-spark"}`}>{p}</Link>
      ))}
      {page < pages && <Link {...linkProps(page + 1)} className="rounded-sm border px-3 py-2 text-sm font-semibold hover:border-spark">Next →</Link>}
    </nav>
  );
}
