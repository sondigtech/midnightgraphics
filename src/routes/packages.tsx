import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/site/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { packagesQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages & Pricing | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Flexible design, branding, printing and digital packages from Midnight Graphics Enterprises, built around real business needs in Tanzania.",
      },
      { property: "og:title", content: "Packages | Midnight Graphics Enterprises" },
      { property: "og:description", content: "Flexible bundles built around real business needs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Packages,
});

function Packages() {
  const { t, pick, lang } = useI18n();
  const packages = useQuery(packagesQuery());

  return (
    <SiteShell>
      <PageHeader eyebrow={t("nav.packages")} title={t("packages.title")} subtitle={t("packages.subtitle")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {packages.isLoading ? (
          <CardsSkeleton />
        ) : packages.isError ? (
          <ErrorState />
        ) : (packages.data ?? []).length === 0 ? (
          <EmptyState message="Packages will appear here." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(packages.data ?? []).map((pkg) => {
              const features = (lang === "sw" ? pkg.features_sw : pkg.features_en) ?? pkg.features_en ?? [];
              return (
                <article
                  key={pkg.id}
                  className={cn(
                    "card-lift relative flex flex-col rounded-2xl border bg-card p-6",
                    pkg.popular ? "border-accent shadow-glow" : "border-border",
                  )}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-6 bg-accent text-accent-foreground">
                      {t("packages.popular")}
                    </Badge>
                  )}
                  <h2 className="text-lg font-semibold">{pick(pkg.name_en, pkg.name_sw)}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pick(pkg.description_en, pkg.description_sw)}
                  </p>
                  <p className="mt-4 text-2xl font-bold">
                    {pkg.price != null
                      ? `${pkg.currency ?? "TZS"} ${Number(pkg.price).toLocaleString()}`
                      : t("packages.onRequest")}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6" disabled={!pkg.available}>
                    <Link to="/request" search={{ service: pkg.name_en }}>
                      {pkg.cta_text || t("cta.requestPackage")}
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
