export const SITE = {
  name: "Info Spark's",
  tagline: "Your World. Your News. Your Daily Update.",
  description:
    "Info Spark's brings you world news, Pakistan news, technology, business, sports, health, science and lifestyle stories — clear, balanced and up to date.",
  email: "contact@infosparks.example",
  // Paste your AdSense publisher ID (e.g. "ca-pub-1234567890123456") to switch ad slots from placeholders to live ads.
  adsenseClient: "",
  social: {
    facebook: "https://facebook.com",
    x: "https://x.com",
    linkedin: "https://linkedin.com",
    telegram: "https://telegram.org",
  },
};

export const STATIC_PAGES = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/editorial-policy", label: "Editorial Policy" },
] as const;
