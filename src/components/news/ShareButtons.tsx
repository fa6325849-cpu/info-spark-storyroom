import { useEffect, useState } from "react";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.origin + path), [path]);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, cls: "F" },
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, cls: "W" },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, cls: "X" },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, cls: "in" },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, cls: "T" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Share</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l.name}`}
          className="grid h-9 min-w-9 place-items-center rounded-sm border px-2.5 text-xs font-bold text-navy transition-colors hover:border-spark hover:bg-spark hover:text-spark-foreground">
          {l.name}
        </a>
      ))}
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="h-9 rounded-sm border px-2.5 text-xs font-bold text-navy hover:border-navy">
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
