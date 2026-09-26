import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, flagCell, priceCell } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/packages")({ component: () => (
  <CrudManager table="packages" title="Packages" invalidate={["packages"]}
    defaults={{ currency: "TZS", pricing_type: "STARTING_FROM", published: true, available: true, popular: false, features_en: [], features_sw: [], updated_at: null }}
    columns={[
      { key: "name_en", label: "Name" },
      { key: "price", label: "Price", render: priceCell },
      { key: "pricing_type", label: "Type" },
      { key: "popular", label: "", render: (r) => flagCell("Popular")(r["popular"]) },
    ]}
    fields={[
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_sw", label: "Name (Swahili)", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "pricing_type", label: "Pricing type", type: "select", options: ["STARTING_FROM", "FIXED", "CONTACT_FOR_QUOTE"], required: true },
      { key: "price", label: "Price (TZS)", type: "number" },
      { key: "currency", label: "Currency", type: "text" },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "features_en", label: "Features (English)", type: "list" },
      { key: "features_sw", label: "Features (Swahili)", type: "list" },
      { key: "cta_text", label: "Button text", type: "text" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "popular", label: "Popular", type: "boolean" },
      { key: "available", label: "Available", type: "boolean" },
      { key: "published", label: "Published", type: "boolean" },
    ]} />
) });
