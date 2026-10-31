import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getCategories } from "@/lib/news.functions";
import { SiteHeader } from "@/components/news/SiteHeader";
import { SiteFooter } from "@/components/news/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-black text-spark">404</p>
        <h1 className="mt-4 text-2xl font-bold">Story not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-navy-foreground">Back to homepage</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="rounded-sm border px-4 py-2 text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => getCategories(),
  staleTime: 5 * 60_000,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#14204a" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "alternate", type: "application/rss+xml", href: "/sitemap.xml", title: "Sitemap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: SITE.name, slogan: SITE.tagline }),
      },
      ...(SITE.adsenseClient
        ? [{ async: true, src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`, crossOrigin: "anonymous" as const }]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const categories = Route.useLoaderData() ?? [];
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-spark focus:p-2 focus:text-spark-foreground">Skip to content</a>
      <SiteHeader categories={categories} />
      <main id="main" className="min-h-[60vh]">
        <Outlet />
      </main>
      <SiteFooter categories={categories} />
      <Toaster />
    </QueryClientProvider>
  );
}
