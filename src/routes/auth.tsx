import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In | Info Spark's" },
      { name: "description", content: "Staff Sign In — Info Spark's." },
      { property: "og:title", content: "Staff Sign In | Info Spark's" },
      { property: "og:description", content: "Staff Sign In — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: () => (
    <StaticPage title="Staff Sign In">
      <p>The staff dashboard is not yet available.</p>
    </StaticPage>
  ),
});
