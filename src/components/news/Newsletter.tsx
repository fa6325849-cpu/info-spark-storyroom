import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.string().trim().email().max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "ok" | "err" | "busy"; msg?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) return setState({ kind: "err", msg: "Please enter a valid email address." });
    setState({ kind: "busy" });
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.toLowerCase() });
    if (error && error.code !== "23505") return setState({ kind: "err", msg: "Something went wrong. Please try again." });
    setEmail("");
    setState({ kind: "ok", msg: error ? "You're already subscribed — thank you!" : "Thanks! You're subscribed to the daily briefing." });
  }

  return (
    <section className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-spark">Daily Briefing</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Start every morning informed.</h2>
          <p className="mt-2 text-navy-foreground/75">The day's most important stories, delivered to your inbox. No spam, unsubscribe any time.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" aria-label="Newsletter subscription">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <Input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 border-navy-soft bg-navy-soft text-navy-foreground placeholder:text-navy-foreground/50" />
          <Button type="submit" variant="spark" size="lg" className="h-12" disabled={state.kind === "busy"}>
            {state.kind === "busy" ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
        {state.msg && (
          <p role="status" className={`md:col-start-2 text-sm ${state.kind === "err" ? "text-spark" : "text-navy-foreground/85"}`}>{state.msg}</p>
        )}
      </div>
    </section>
  );
}
