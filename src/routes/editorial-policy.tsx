import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy | Info Spark's" },
      { name: "description", content: "Editorial Policy — Info Spark's." },
      { property: "og:title", content: "Editorial Policy | Info Spark's" },
      { property: "og:description", content: "Editorial Policy — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/editorial-policy" }],
  }),
  component: () => (
    <StaticPage title="Editorial Policy">
      <p>We verify facts with reliable sources, separate news from opinion, correct errors promptly and label sponsored or sample content clearly.</p>
    </StaticPage>
  ),
});
