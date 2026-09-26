import { createFileRoute } from "@tanstack/react-router";
import { SingletonForm } from "@/components/admin/SingletonForm";

export const Route = createFileRoute("/admin/settings")({ component: () => (
  <SingletonForm table="site_settings" title="Site Settings" invalidate="site_settings" fields={[
    { key: "company_name", label: "Company name", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "whatsapp", label: "WhatsApp number (e.g. 255775057780)", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "business_hours", label: "Business hours", type: "text" },
    { key: "instagram", label: "Instagram link", type: "text" },
    { key: "tiktok", label: "TikTok link", type: "text" },
    { key: "hero_title_en", label: "Homepage title (English)", type: "text" },
    { key: "hero_title_sw", label: "Homepage title (Swahili)", type: "text" },
    { key: "hero_subtitle_en", label: "Homepage subtitle (English)", type: "textarea" },
    { key: "hero_subtitle_sw", label: "Homepage subtitle (Swahili)", type: "textarea" },
    { key: "about_en", label: "About (English)", type: "textarea" },
    { key: "about_sw", label: "About (Swahili)", type: "textarea" },
    { key: "stat_projects", label: "Projects stat", type: "text" },
    { key: "stat_clients", label: "Clients stat", type: "text" },
    { key: "stat_services", label: "Services stat", type: "text" },
    { key: "stat_years", label: "Years stat", type: "text" },
    { key: "seo_title", label: "SEO title", type: "text", full: true },
    { key: "seo_description", label: "SEO description", type: "textarea" },
  ]} />
) });
