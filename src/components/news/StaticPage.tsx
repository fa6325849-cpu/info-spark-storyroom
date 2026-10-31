import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mt-4 text-4xl font-black">{title}</h1>
      <div className="prose-news mt-6">{children}</div>
    </div>
  );
}
