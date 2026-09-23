import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/site/states";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { portfolioQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Browse branding, graphic design, printing, 3D, motion and digital projects delivered by Midnight Graphics Enterprises in Tanzania.",
      },
      { property: "og:title", content: "Portfolio | Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "Selected creative and digital projects by Midnight Graphics Enterprises.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { t, pick } = useI18n();
  const items = useQuery(portfolioQuery());
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const set = new Set((items.data ?? []).map((i) => i.category));
    return ["all", ...Array.from(set)];
  }, [items.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items.data ?? []).filter((i) => {
      const matchCat = category === "all" || i.category === category;
      const matchText =
        !q ||
        i.title.toLowerCase().includes(q) ||
        (i.client ?? "").toLowerCase().includes(q) ||
        (i.description_en ?? "").toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [items.data, category, search]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow={t("nav.portfolio")}
        title={t("portfolio.title")}
        subtitle={t("showcase.title")}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("portfolio.category")}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === c
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "all" ? t("portfolio.all") : c}
              </button>
            ))}
          </div>
          <div className="lg:w-72">
            <label htmlFor="portfolio-search" className="sr-only">
              {t("portfolio.search")}
            </label>
            <Input
              id="portfolio-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("portfolio.search")}
            />
          </div>
        </div>

        <div className="mt-10">
          {items.isLoading ? (
            <CardsSkeleton count={6} />
          ) : items.isError ? (
            <ErrorState />
          ) : filtered.length === 0 ? (
            <EmptyState message={t("portfolio.empty")} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  to="/portfolio/$id"
                  params={{ id: item.id }}
                  className="card-lift group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        {item.category}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {item.category}
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {pick(item.description_en, item.description_sw)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
