import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Info Spark's" },
      { name: "description", content: "About Us — Info Spark's." },
      { property: "og:title", content: "About Us | Info Spark's" },
      { property: "og:description", content: "About Us — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <StaticPage title="About Us">
      <p>Info Spark's is an independent digital news publication. Our mission: Your World. Your News. Your Daily Update.</p><p>We cover world affairs, Pakistan, technology, business, sports, health, science, education, lifestyle and travel.</p>
    </StaticPage>
  ),
});
