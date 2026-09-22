import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/site/states";
import { useI18n } from "@/lib/i18n";
import { servicesQuery } from "@/lib/data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Graphic design, branding, printing, 3D and motion design, social media content, web development, app development and software services in Tanzania.",
      },
      { property: "og:title", content: "Services | Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "Design, print and technology services delivered with craft and care.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  const { t, pick } = useI18n();
  const services = useQuery(servicesQuery());

  return (
    <SiteShell>
      <PageHeader eyebrow={t("nav.services")} title={t("services.title")} subtitle={t("services.subtitle")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {services.isLoading ? (
          <CardsSkeleton count={9} />
        ) : services.isError ? (
          <ErrorState />
        ) : (services.data ?? []).length === 0 ? (
          <EmptyState message="Services will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(services.data ?? []).map((service) => (
              <article key={service.id} className="card-lift flex flex-col rounded-xl border border-border bg-card p-6">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt=""
                    loading="lazy"
                    className="mb-4 aspect-[16/10] w-full rounded-lg object-cover"
                  />
                )}
                <h2 className="text-base font-semibold">{pick(service.name_en, service.name_sw)}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {pick(service.description_en, service.description_sw)}
                </p>
                {service.price_from != null && (
                  <p className="mt-4 text-sm font-semibold">
                    {t("services.from")} {service.currency ?? "TZS"}{" "}
                    {Number(service.price_from).toLocaleString()}
                  </p>
                )}
                <Link
                  to="/request"
                  search={{ service: service.name_en }}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-accent"
                >
                  {t("cta.requestService")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
