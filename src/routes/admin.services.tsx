import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, priceCell } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/services")({ component: () => (
  <CrudManager table="services" title="Services" invalidate={["services"]}
    defaults={{ currency: "TZS", icon: "Sparkles", published: true }}
    columns={[
      { key: "name_en", label: "Name" },
      { key: "price_from", label: "From", render: priceCell },
    ]}
    fields={[
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_sw", label: "Name (Swahili)", type: "text" },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "price_from", label: "Price from (TZS)", type: "number" },
      { key: "icon", label: "Icon name (e.g. Palette)", type: "text" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "published", label: "Published", type: "boolean" },
    ]} />
) });
