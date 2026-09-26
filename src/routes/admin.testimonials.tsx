import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/testimonials")({ component: () => (
  <CrudManager table="testimonials" title="Testimonials" invalidate={["testimonials"]}
    defaults={{ published: true, rating: 5 }}
    columns={[
      { key: "client_name", label: "Client" },
      { key: "company", label: "Company" },
      { key: "rating", label: "Rating" },
    ]}
    fields={[
      { key: "client_name", label: "Client name", type: "text", required: true },
      { key: "company", label: "Company", type: "text" },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "quote_en", label: "Quote (English)", type: "textarea", required: true },
      { key: "quote_sw", label: "Quote (Swahili)", type: "textarea" },
      { key: "published", label: "Published", type: "boolean" },
    ]} />
) });
