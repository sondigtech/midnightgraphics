import { createFileRoute, notFound } from "@tanstack/react-router";
import { SECTIONS } from "@/components/admin/config";
import { InboxManager, ResourceManager, SingletonEditor } from "@/components/admin/Managers";

export const Route = createFileRoute("/admin/$section")({
  beforeLoad: ({ params }) => {
    if (!SECTIONS[params.section]) throw notFound();
  },
  component: Section,
});

function Section() {
  const { section } = Route.useParams();
  const config = SECTIONS[section];
  if (!config) return null;
  if (config.kind === "resource") return <ResourceManager key={section} config={config} />;
  if (config.kind === "singleton") return <SingletonEditor key={section} config={config} />;
  return <InboxManager key={section} config={config} />;
}
