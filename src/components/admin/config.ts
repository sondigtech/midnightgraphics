import { PORTFOLIO_CATEGORIES } from "@/lib/brand";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "image" | "select" | "list" | "date";
export type Field = { key: string; label: string; type: FieldType; options?: readonly string[]; required?: boolean };

export type ResourceConfig = {
  kind: "resource";
  table: string;
  title: string;
  titleKey: string;
  subtitleKey?: string;
  publishKey?: string;
  softDelete?: boolean;
  fields: Field[];
};
export type SingletonConfig = { kind: "singleton"; table: string; title: string; fields: Field[] };
export type InboxConfig = { kind: "inbox"; table: "service_requests" | "contact_messages"; title: string };
export type SectionConfig = ResourceConfig | SingletonConfig | InboxConfig;

export const SECTIONS: Record<string, SectionConfig> = {
  portfolio: {
    kind: "resource",
    table: "portfolio",
    title: "Portfolio",
    titleKey: "title",
    subtitleKey: "category",
    publishKey: "published",
    softDelete: true,
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: PORTFOLIO_CATEGORIES },
      { key: "cover_url", label: "Cover image", type: "image" },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "client", label: "Client", type: "text" },
      { key: "project_date", label: "Project date", type: "date" },
      { key: "project_url", label: "Project link", type: "text" },
      { key: "video_url", label: "Video link", type: "text" },
      { key: "tools", label: "Tools (one per line)", type: "list" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  services: {
    kind: "resource",
    table: "services",
    title: "Services",
    titleKey: "name_en",
    subtitleKey: "name_sw",
    publishKey: "published",
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_sw", label: "Name (Swahili)", type: "text" },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "icon", label: "Icon name", type: "text" },
      { key: "price_from", label: "Price from (TZS)", type: "number" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  packages: {
    kind: "resource",
    table: "packages",
    title: "Packages",
    titleKey: "name_en",
    subtitleKey: "price",
    publishKey: "published",
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_sw", label: "Name (Swahili)", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "price", label: "Price (TZS)", type: "number" },
      { key: "pricing_type", label: "Pricing type", type: "select", options: ["STARTING_FROM", "FIXED", "CONTACT_FOR_QUOTE"] },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "features_en", label: "Features English (one per line)", type: "list" },
      { key: "features_sw", label: "Features Swahili (one per line)", type: "list" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "cta_text", label: "Button text", type: "text" },
      { key: "popular", label: "Popular", type: "boolean" },
      { key: "available", label: "Available", type: "boolean" },
      { key: "published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  testimonials: {
    kind: "resource",
    table: "testimonials",
    title: "Testimonials",
    titleKey: "client_name",
    subtitleKey: "company",
    publishKey: "published",
    fields: [
      { key: "client_name", label: "Client name", type: "text", required: true },
      { key: "company", label: "Company", type: "text" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "quote_en", label: "Quote (English)", type: "textarea", required: true },
      { key: "quote_sw", label: "Quote (Swahili)", type: "textarea" },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  requests: { kind: "inbox", table: "service_requests", title: "Service Requests" },
  messages: { kind: "inbox", table: "contact_messages", title: "Contact Messages" },
  ceo: {
    kind: "singleton",
    table: "ceo_profile",
    title: "CEO Profile",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "position_en", label: "Position (English)", type: "text" },
      { key: "position_sw", label: "Position (Swahili)", type: "text" },
      { key: "bio_en", label: "Biography (English)", type: "textarea" },
      { key: "bio_sw", label: "Biography (Swahili)", type: "textarea" },
      { key: "philosophy_en", label: "Philosophy (English)", type: "textarea" },
      { key: "philosophy_sw", label: "Philosophy (Swahili)", type: "textarea" },
      { key: "experience_en", label: "Experience (English)", type: "textarea" },
      { key: "experience_sw", label: "Experience (Swahili)", type: "textarea" },
      { key: "skills", label: "Skills (one per line)", type: "list" },
      { key: "cv_url", label: "CV link", type: "text" },
    ],
  },
  settings: {
    kind: "singleton",
    table: "site_settings",
    title: "Site Settings",
    fields: [
      { key: "company_name", label: "Company name", type: "text", required: true },
      { key: "tagline_en", label: "Tagline (English)", type: "text" },
      { key: "tagline_sw", label: "Tagline (Swahili)", type: "text" },
      { key: "hero_title_en", label: "Homepage title (English)", type: "text" },
      { key: "hero_title_sw", label: "Homepage title (Swahili)", type: "text" },
      { key: "hero_subtitle_en", label: "Homepage subtitle (English)", type: "textarea" },
      { key: "hero_subtitle_sw", label: "Homepage subtitle (Swahili)", type: "textarea" },
      { key: "about_en", label: "About (English)", type: "textarea" },
      { key: "about_sw", label: "About (Swahili)", type: "textarea" },
      { key: "stat_projects", label: "Stat: projects", type: "text" },
      { key: "stat_clients", label: "Stat: clients", type: "text" },
      { key: "stat_services", label: "Stat: services", type: "text" },
      { key: "stat_years", label: "Stat: years", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "whatsapp", label: "WhatsApp number", type: "text" },
      { key: "instagram", label: "Instagram link", type: "text" },
      { key: "tiktok", label: "TikTok link", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "business_hours", label: "Business hours", type: "text" },
      { key: "seo_title", label: "SEO title", type: "text" },
      { key: "seo_description", label: "SEO description", type: "textarea" },
    ],
  },
};
