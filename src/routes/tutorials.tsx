import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, Lock } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/site/states";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/brand";
import { tutorialPriceQuery, tutorialsQuery } from "@/lib/tutorials";

export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Design Tutorials | Midnight Graphics Enterprises" },
      { name: "description", content: "Watch free previews of graphic design tutorials and unlock full lessons with a monthly student plan." },
      { property: "og:title", content: "Design Tutorials | Midnight Graphics" },
      { property: "og:description", content: "Free previews, full lessons for enrolled students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TutorialsLayout,
});

function TutorialsLayout() {
  const match = useMatchRoute();
  if (match({ to: "/tutorials/$id", fuzzy: true })) return <Outlet />;
  return <TutorialsList />;
}

function TutorialsList() {
  const list = useQuery(tutorialsQuery);
  const price = useQuery(tutorialPriceQuery);
  return (
    <SiteShell>
      <PageHeader eyebrow="Tutorials / Mafunzo" title="Learn design with Midnight Graphics"
        subtitle={`Watch a free preview of every tutorial (under 1 minute). Enroll for ${formatMoney(price.data?.price ?? 50000)} / month to watch everything.`} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="font-semibold">Student plan: {formatMoney(price.data?.price ?? 50000)} / month</p>
            <p className="text-sm text-muted-foreground">Full access to all tutorials for 30 days.</p>
          </div>
          <Button asChild><Link to="/dashboard">Enroll in Student Portal</Link></Button>
        </div>
        {list.isLoading ? <CardsSkeleton /> : list.error ? <ErrorState /> : !list.data?.length ? (
          <EmptyState title="No tutorials yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.data.map((t) => (
              <Link key={t.id} to="/tutorials/$id" params={{ id: t.id }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-elegant">
                <div className="relative aspect-video bg-secondary">
                  {t.thumbnail_url && <img src={t.thumbnail_url} alt={t.title} className="h-full w-full object-cover" loading="lazy" />}
                  <PlayCircle className="absolute inset-0 m-auto h-14 w-14 text-primary-foreground drop-shadow-lg transition group-hover:scale-110" />
                </div>
                <div className="space-y-1 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.category}</p>
                  <h3 className="font-semibold">{t.title}</h3>
                  {t.description && <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                  <p className="flex items-center gap-1 pt-2 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Free {t.preview_seconds}s preview{t.duration ? ` · ${t.duration}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
