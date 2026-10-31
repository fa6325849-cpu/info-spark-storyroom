import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/news/StaticPage";
export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Info Spark's" },
      { name: "description", content: "Privacy Policy — Info Spark's." },
      { property: "og:title", content: "Privacy Policy | Info Spark's" },
      { property: "og:description", content: "Privacy Policy — Info Spark's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: () => (
    <StaticPage title="Privacy Policy">
      <p>We collect only the information you give us (newsletter email, comments). We use cookies and third-party advertising partners such as Google AdSense, which may use cookies to serve ads based on your visits. You can opt out of personalised ads via Google Ads Settings.</p>
    </StaticPage>
  ),
});
