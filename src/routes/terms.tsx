import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | Info Spark's" },
      { name: "description", content: "Terms and Conditions — Info Spark's." },
      { property: "og:title", content: "Terms and Conditions | Info Spark's" },
      { property: "og:description", content: "Terms and Conditions — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <StaticPage title="Terms and Conditions">
      <p>By using this website you agree to use it lawfully. Content is provided for information only and may not be republished without permission.</p>
    </StaticPage>
  ),
});
