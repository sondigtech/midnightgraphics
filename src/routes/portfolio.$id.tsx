import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, ErrorState, Spinner } from "@/components/site/states";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { portfolioItemQuery } from "@/lib/data";

export const Route = createFileRoute("/portfolio/$id")({
  head: () => ({
    meta: [
      { title: "Project | Midnight Graphics Enterprises" },
      {
        name: "description",
        content: "Project details, gallery and tools used for this Midnight Graphics project.",
      },
      { property: "og:title", content: "Project | Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "Project details, gallery and tools used for this Midnight Graphics project.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioDetail,
  errorComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState />
      </div>
    </SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState message="Project not found." />
      </div>
    </SiteShell>
  ),
});

function PortfolioDetail() {
  const { id } = Route.useParams();
  const { t, pick } = useI18n();
  const item = useQuery(portfolioItemQuery(id));

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/portfolio" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("portfolio.back")}
        </Link>

        {item.isLoading ? (
          <Spinner label={t("common.loading")} />
        ) : item.isError ? (
          <div className="mt-8">
            <ErrorState />
          </div>
        ) : !item.data ? (
          <div className="mt-8">
            <EmptyState message={t("portfolio.empty")} />
          </div>
        ) : (
          <article className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {item.data.category}
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{item.data.title}</h1>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              {pick(item.data.description_en, item.data.description_sw)}
            </p>

            <dl className="mt-8 grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-3">
              {item.data.client && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("portfolio.client")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{item.data.client}</dd>
                </div>
              )}
              {item.data.project_date && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("portfolio.date")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{item.data.project_date}</dd>
                </div>
              )}
              {(item.data.tools ?? []).length > 0 && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("portfolio.tools")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{(item.data.tools ?? []).join(", ")}</dd>
                </div>
              )}
            </dl>

            {item.data.cover_url && (
              <img
                src={item.data.cover_url}
                alt={item.data.title}
                className="mt-8 w-full rounded-xl border border-border object-cover"
              />
            )}

            {(item.data.images ?? []).length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(item.data.images ?? []).map((img) => (
                  <img
                    key={img.path}
                    src={img.url}
                    alt={img.name ?? item.data!.title}
                    loading="lazy"
                    className="w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            )}

            {item.data.video_url && (
              <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border">
                <iframe
                  src={item.data.video_url}
                  title={item.data.title}
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {item.data.project_url && (
                <Button asChild variant="outline">
                  <a href={item.data.project_url} target="_blank" rel="noreferrer noopener">
                    {t("portfolio.visit")} <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button asChild>
                <Link to="/request">{t("cta.request")}</Link>
              </Button>
            </div>
          </article>
        )}
      </div>
    </SiteShell>
  );
}
