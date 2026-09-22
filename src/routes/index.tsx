import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, ShieldCheck, Rocket, Palette, Code2, Printer } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { CardsSkeleton, EmptyState } from "@/components/site/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND, LOGO_URL, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { portfolioQuery, servicesQuery, settingsQuery, testimonialsQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midnight Graphics Enterprises | Creative Design & Digital Technology Tanzania" },
      {
        name: "description",
        content:
          "Midnight Graphics Enterprises delivers professional graphic design, branding, printing, digital content, web and mobile app development in Tanzania.",
      },
      { property: "og:title", content: "Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "Creative design, printing and digital technology solutions built in Tanzania.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const WHY = [
  { icon: Palette, en: "Original creative direction", sw: "Ubunifu wa asili" },
  { icon: ShieldCheck, en: "Reliable and professional delivery", sw: "Utoaji wa kuaminika" },
  { icon: Rocket, en: "Fast turnaround times", sw: "Kazi kwa wakati" },
  { icon: Printer, en: "Print-ready quality files", sw: "Faili tayari kwa uchapishaji" },
  { icon: Code2, en: "Modern technology stack", sw: "Teknolojia ya kisasa" },
  { icon: Star, en: "Bilingual client support", sw: "Msaada kwa lugha mbili" },
];

function Home() {
  const { t, pick, lang } = useI18n();
  const settings = useQuery(settingsQuery());
  const services = useQuery(servicesQuery());
  const portfolio = useQuery(portfolioQuery());
  const testimonials = useQuery(testimonialsQuery());

  const s = settings.data;
  const featured = (portfolio.data ?? []).slice(0, 6);

  const stats = [
    { value: s?.stat_projects ?? "100+", label: t("about.stats.projects") },
    { value: s?.stat_clients ?? "50+", label: t("about.stats.clients") },
    { value: s?.stat_services ?? "28", label: t("about.stats.services") },
    { value: s?.stat_years ?? "5+", label: t("about.stats.years") },
  ];

  return (
    <SiteShell>
      <section className="surface-midnight relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float-slow" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <Badge className="bg-white/10 text-midnight-foreground hover:bg-white/15">
              {pick(s?.tagline_en, s?.tagline_sw) || "Graphic Design • Digital Creator"}
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {pick(s?.hero_title_en, s?.hero_title_sw) ||
                "Creative Design. Digital Innovation. Limitless Possibilities."}
            </h1>
            <p className="mt-5 max-w-xl text-midnight-foreground/75">
              {pick(s?.hero_subtitle_en, s?.hero_subtitle_sw)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/request">
                  {t("cta.getStarted")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-midnight-foreground hover:bg-white/10"
              >
                <Link to="/portfolio">{t("cta.explore")}</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-accent sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-midnight-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto max-w-sm lg:max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-accent/20 blur-2xl" />
            <img
              src={LOGO_URL}
              alt={`${BRAND.name} logo`}
              className="relative w-full rounded-[2rem] bg-white/5 p-8 shadow-elegant"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t("services.title")}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("services.subtitle")}</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/services">
              {t("cta.viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          {services.isLoading ? (
            <CardsSkeleton />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(services.data ?? []).slice(0, 6).map((service) => (
                <article key={service.id} className="card-lift rounded-xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold">{pick(service.name_en, service.name_sw)}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {pick(service.description_en, service.description_sw)}
                  </p>
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
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("showcase.title")}</h2>
          <div className="mt-8">
            {portfolio.isLoading ? (
              <CardsSkeleton />
            ) : featured.length === 0 ? (
              <EmptyState message={t("showcase.empty")} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((item) => (
                  <Link
                    key={item.id}
                    to="/portfolio/$id"
                    params={{ id: item.id }}
                    className="card-lift group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{item.category}</p>
                      <h3 className="mt-1 font-semibold">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("why.title")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((item) => (
            <div key={item.en} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium">{lang === "sw" ? item.sw : item.en}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("testimonials.title")}</h2>
          <div className="mt-8">
            {testimonials.isLoading ? (
              <CardsSkeleton count={3} />
            ) : (testimonials.data ?? []).length === 0 ? (
              <EmptyState message={t("testimonials.empty")} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(testimonials.data ?? []).map((item) => (
                  <figure key={item.id} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex gap-0.5 text-accent">
                      {Array.from({ length: item.rating ?? 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-3 text-sm text-muted-foreground">
                      “{pick(item.quote_en, item.quote_sw)}”
                    </blockquote>
                    <figcaption className="mt-4 text-sm font-semibold">
                      {item.client_name}
                      {item.company && <span className="block text-xs text-muted-foreground">{item.company}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="surface-midnight rounded-2xl px-6 py-12 text-center shadow-elegant sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("tech.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-midnight-foreground/75">
            {pick(s?.about_en, s?.about_sw)}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/request">{t("cta.request")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/5 text-midnight-foreground hover:bg-white/10"
            >
              <a href={whatsappLink(`Hello ${BRAND.shortName}!`)} target="_blank" rel="noreferrer noopener">
                {t("cta.whatsapp")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export { PageHeader };
