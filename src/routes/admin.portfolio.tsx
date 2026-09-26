import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, flagCell } from "@/components/admin/CrudManager";
import { PORTFOLIO_CATEGORIES } from "@/lib/brand";

export const Route = createFileRoute("/admin/portfolio")({ component: () => (
  <CrudManager table="portfolio" title="Portfolio" softDelete invalidate={["portfolio"]}
    defaults={{ category: "Other", published: true, featured: false, images: [], tools: [] }}
    columns={[
      { key: "cover_url", label: "", render: (r) => r["cover_url"] ? <img src={r["cover_url"]} alt="" className="h-10 w-14 rounded object-cover" /> : null },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "featured", label: "", render: (r) => flagCell("Featured")(r["featured"]) },
    ]}
    fields={[
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: PORTFOLIO_CATEGORIES, required: true },
      { key: "client", label: "Client", type: "text" },
      { key: "project_date", label: "Project date", type: "date" },
      { key: "project_url", label: "Project link", type: "text" },
      { key: "video_url", label: "Video link", type: "text" },
      { key: "description_en", label: "Description (English)", type: "textarea" },
      { key: "description_sw", label: "Description (Swahili)", type: "textarea" },
      { key: "tools", label: "Tools used", type: "list" },
      { key: "cover_url", label: "Cover image", type: "image" },
      { key: "images", label: "Gallery", type: "gallery" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "published", label: "Published", type: "boolean" },
    ]} />
) });
