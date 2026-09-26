import { createFileRoute } from "@tanstack/react-router";
import { SingletonForm } from "@/components/admin/SingletonForm";

export const Route = createFileRoute("/admin/ceo")({ component: () => (
  <SingletonForm table="ceo_profile" title="CEO Profile" invalidate="ceo_profile" fields={[
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
    { key: "skills", label: "Skills", type: "list" },
    { key: "cv_url", label: "CV link", type: "text", full: true },
  ]} />
) });
