import { useEffect } from "react";
import { SITE } from "@/lib/site";

const SIZES = {
  leaderboard: "min-h-[90px] max-w-[728px]",
  banner: "min-h-[120px]",
  rectangle: "min-h-[250px] max-w-[300px]",
  inarticle: "min-h-[120px]",
} as const;

/** Reserved advertisement area. Renders a Google AdSense unit when SITE.adsenseClient is set. */
export function AdSlot({ size = "banner", slot = "" }: { size?: keyof typeof SIZES; slot?: string }) {
  useEffect(() => {
    if (!SITE.adsenseClient) return;
    try {
      // @ts-expect-error adsbygoogle injected by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <aside aria-label="Advertisement" className={`mx-auto my-2 w-full ${SIZES[size]}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Advertisement</p>
      {SITE.adsenseClient ? (
        <ins className="adsbygoogle block" data-ad-client={SITE.adsenseClient} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      ) : (
        <div className={`grid w-full place-items-center rounded-sm border border-dashed bg-muted/60 text-xs text-muted-foreground ${SIZES[size]}`}>
          Ad space
        </div>
      )}
    </aside>
  );
}
