import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Info Spark's" },
      { name: "description", content: "Contact Us — Info Spark's." },
      { property: "og:title", content: "Contact Us | Info Spark's" },
      { property: "og:description", content: "Contact Us — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <StaticPage title="Contact Us">
      <p>Email the newsroom at contact@infosparks.example. We aim to reply within two working days.</p>
    </StaticPage>
  ),
});
