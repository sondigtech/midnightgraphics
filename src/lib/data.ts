import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Service = {
  id: string;
  name_en: string;
  name_sw: string | null;
  description_en: string | null;
  description_sw: string | null;
  icon: string | null;
  price_from: number | null;
  currency: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

export type Package = {
  id: string;
  name_en: string;
  name_sw: string | null;
  description_en: string | null;
  description_sw: string | null;
  price: number | null;
  currency: string | null;
  features_en: string[] | null;
  features_sw: string[] | null;
  image_url: string | null;
  popular: boolean;
  cta_text: string | null;
  available: boolean;
  published: boolean;
  sort_order: number;
};

export type PortfolioImage = { path: string; url: string; name?: string };

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  description_en: string | null;
  description_sw: string | null;
  client: string | null;
  project_date: string | null;
  project_url: string | null;
  video_url: string | null;
  cover_url: string | null;
  images: PortfolioImage[];
  tools: string[] | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  company: string | null;
  photo_url: string | null;
  quote_en: string;
  quote_sw: string | null;
  rating: number | null;
  published: boolean;
  sort_order: number;
};

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type CeoProfile = Database["public"]["Tables"]["ceo_profile"]["Row"];

export type ServiceRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  service: string | null;
  description: string | null;
  budget: string | null;
  deadline: string | null;
  company: string | null;
  extra_info: string | null;
  attachment_url: string | null;
  status: "new" | "contacted" | "in_progress" | "completed" | "cancelled";
  admin_notes: string | null;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

async function rows<T>(table: string, build: (q: any) => any): Promise<T[]> {
  const { data, error } = await build((supabase.from as any)(table).select("*"));
  if (error) throw error;
  return (data ?? []) as T[];
}

export const servicesQuery = (adminView = false) =>
  queryOptions({
    queryKey: ["services", adminView],
    queryFn: () =>
      rows<Service>("services", (q) =>
        adminView ? q.order("sort_order") : q.eq("published", true).order("sort_order"),
      ),
  });

export const packagesQuery = (adminView = false) =>
  queryOptions({
    queryKey: ["packages", adminView],
    queryFn: () =>
      rows<Package>("packages", (q) =>
        adminView ? q.order("sort_order") : q.eq("published", true).order("sort_order"),
      ),
  });

export const portfolioQuery = (adminView = false) =>
  queryOptions({
    queryKey: ["portfolio", adminView],
    queryFn: () =>
      rows<PortfolioItem>("portfolio", (q) =>
        adminView
          ? q.is("deleted_at", null).order("sort_order").order("created_at", { ascending: false })
          : q
              .eq("published", true)
              .is("deleted_at", null)
              .order("sort_order")
              .order("created_at", { ascending: false }),
      ),
  });

export const portfolioItemQuery = (id: string) =>
  queryOptions({
    queryKey: ["portfolio-item", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as PortfolioItem | null;
    },
  });

export const testimonialsQuery = (adminView = false) =>
  queryOptions({
    queryKey: ["testimonials", adminView],
    queryFn: () =>
      rows<Testimonial>("testimonials", (q) =>
        adminView ? q.order("sort_order") : q.eq("published", true).order("sort_order"),
      ),
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
    staleTime: 60_000,
  });

export const ceoQuery = () =>
  queryOptions({
    queryKey: ["ceo_profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ceo_profile").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as CeoProfile | null;
    },
    staleTime: 60_000,
  });

export const requestsQuery = () =>
  queryOptions({
    queryKey: ["service_requests"],
    queryFn: () =>
      rows<ServiceRequest>("service_requests", (q) => q.order("created_at", { ascending: false })),
  });

export const messagesQuery = () =>
  queryOptions({
    queryKey: ["contact_messages"],
    queryFn: () =>
      rows<ContactMessage>("contact_messages", (q) => q.order("created_at", { ascending: false })),
  });
