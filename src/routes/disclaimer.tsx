import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer | Info Spark's" },
      { name: "description", content: "Disclaimer — Info Spark's." },
      { property: "og:title", content: "Disclaimer | Info Spark's" },
      { property: "og:description", content: "Disclaimer — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/disclaimer" }],
  }),
  component: () => (
    <StaticPage title="Disclaimer">
      <p>Information on Info Spark's is published in good faith. Articles labelled Demo are sample demonstration content and are not real news.</p>
    </StaticPage>
  ),
});
