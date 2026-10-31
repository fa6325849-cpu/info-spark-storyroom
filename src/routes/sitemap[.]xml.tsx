import { createFileRoute } from "@tanstack/react-router";
import { getSitemapEntries } from "@/lib/news.functions";

const STATIC = ["/", "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer", "/editorial-policy"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { articles, categories } = await getSitemapEntries();
        const urls = [
          ...STATIC.map((p) => `<url><loc>${origin}${p}</loc><changefreq>daily</changefreq></url>`),
          ...categories.map((c) => `<url><loc>${origin}/category/${c.slug}</loc><changefreq>hourly</changefreq></url>`),
          ...articles.map((a) => `<url><loc>${origin}/news/${a.slug}</loc><lastmod>${new Date(a.updated_at).toISOString()}</lastmod></url>`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
      },
    },
  },
});
