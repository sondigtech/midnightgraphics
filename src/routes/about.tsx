import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Target, Eye, HeartHandshake } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Learn about Midnight Graphics Enterprises, a Tanzanian creative design and digital technology company turning ideas into visual and digital products.",
      },
      { property: "og:title", content: "About Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "A Tanzanian creative design and digital technology company.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const { t, pick } = useI18n();
  const settings = useQuery(settingsQuery());
  const s = settings.data;

  const pillars = [
    {
      icon: Target,
      title: { en: "Our Mission", sw: "Dhamira Yetu" },
      body: {
        en: "To deliver creative design and digital technology that helps African businesses grow with confidence.",
        sw: "Kutoa ubunifu na teknolojia ya kidijitali inayosaidia biashara za Afrika kukua kwa ujasiri.",
      },
    },
    {
      icon: Eye,
      title: { en: "Our Vision", sw: "Maono Yetu" },
      body: {
        en: "To become the most trusted creative technology brand in Tanzania and the wider region.",
        sw: "Kuwa brandi ya teknolojia ya ubunifu inayoaminika zaidi Tanzania na ukanda huu.",
      },
    },
    {
      icon: HeartHandshake,
      title: { en: "Our Values", sw: "Maadili Yetu" },
      body: {
        en: "Craft, honesty, speed and respect for every client, from startups to established institutions.",
        sw: "Ustadi, uaminifu, kasi na heshima kwa kila mteja, kuanzia wanaoanza hadi taasisi kubwa.",
      },
    },
  ];

  const stats = [
    { value: s?.stat_projects ?? "100+", label: t("about.stats.projects") },
    { value: s?.stat_clients ?? "50+", label: t("about.stats.clients") },
    { value: s?.stat_services ?? "28", label: t("about.stats.services") },
    { value: s?.stat_years ?? "5+", label: t("about.stats.years") },
  ];

  return (
    <SiteShell>
      <PageHeader
        eyebrow={t("nav.about")}
        title={t("about.title")}
        subtitle={pick(s?.tagline_en, s?.tagline_sw) ?? undefined}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {pick(s?.about_en, s?.about_sw)}
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title.en} className="card-lift rounded-xl border border-border bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <p.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{pick(p.title.en, p.title.sw)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{pick(p.body.en, p.body.sw)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-secondary/40 p-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/request">{t("cta.request")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/portfolio">{t("cta.explore")}</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
