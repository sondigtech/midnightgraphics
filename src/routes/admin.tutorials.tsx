import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/tutorials")({ component: () => (
  <CrudManager table="tutorials" title="Tutorials" invalidate={["tutorials"]}
    defaults={{ published: true, preview_seconds: 59, category: "Graphic Design" }}
    columns={[
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "preview_seconds", label: "Preview (s)" },
    ]}
    fields={[
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "thumbnail_url", label: "Thumbnail", type: "image" },
      { key: "video_url", label: "Full video link (MP4) — only enrolled students", type: "text", required: true, full: true },
      { key: "preview_url", label: "Preview video link (optional, short clip)", type: "text", full: true },
      { key: "preview_seconds", label: "Free preview seconds (max 59)", type: "number" },
      { key: "duration", label: "Duration (e.g. 12 min)", type: "text" },
      { key: "published", label: "Published", type: "boolean" },
    ]} />
) });
