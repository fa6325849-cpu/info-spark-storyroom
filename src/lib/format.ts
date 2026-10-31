export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi", timeZoneName: "short" } : { timeZone: "Asia/Karachi" }),
  });
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)} days ago`;
  return formatDate(iso);
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function headingId(text: string) {
  return slugify(text) || "section";
}

export function extractHeadings(md: string) {
  return md
    .split("\n")
    .map((l) => /^(#{2,3})\s+(.+)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ level: m[1]!.length, text: m[2]!.replace(/[*_`]/g, ""), id: headingId(m[2]!.replace(/[*_`]/g, "")) }));
}

export function imageUrl(src: string | null | undefined, w = 800) {
  if (!src) return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=70&w=" + w;
  if (src.includes("images.unsplash.com")) return src.replace(/w=\d+/, `w=${w}`);
  return src;
}
