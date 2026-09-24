import logoAsset from "@/assets/midnight-logo.png.asset.json";

export const LOGO_URL = logoAsset.url;

export const BRAND = {
  name: "Midnight Graphics Enterprises",
  shortName: "Midnight Graphics",
  email: "midnightgraphics300@gmail.com",
  whatsapp: "255775057780",
  whatsappDisplay: "+255 775 057 780",
  instagram: "https://www.instagram.com/official.midnight_graphics/",
  tiktok: "https://www.tiktok.com/@midnightgraphics",
  ceo: "Hamidu Ibrahim",
};

export function whatsappLink(message: string, number = BRAND.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Formats an amount the Tanzanian way, e.g. "TSh 150,000". */
export function formatMoney(amount: number | null | undefined, currency = "TZS") {
  if (amount == null) return null;
  const symbol = currency === "TZS" ? "TSh" : currency;
  return `${symbol} ${Number(amount).toLocaleString("en-US")}`;
}

export const PORTFOLIO_CATEGORIES = [
  "Graphic Design",
  "Branding",
  "Printing",
  "3D Design",
  "Motion Graphics",
  "Social Media",
  "Web Development",
  "App Development",
  "Software",
  "Digital Content",
  "Photography",
  "Other",
] as const;

export const REQUEST_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
] as const;
