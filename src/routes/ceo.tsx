import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, MessageCircle } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { ErrorState, Spinner } from "@/components/site/states";
import { Button } from "@/components/ui/button";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { ceoQuery } from "@/lib/data";

export const Route = createFileRoute("/ceo")({
  head: () => ({
    meta: [
      { title: "Hamidu Ibrahim — Founder & CEO | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Meet Hamidu Ibrahim, founder and CEO of Midnight Graphics Enterprises: graphic designer, digital creator and creative technologist based in Tanzania.",
      },
      { property: "og:title", content: "Hamidu Ibrahim — Founder & CEO" },
      {
        property: "og:description",
        content: "Biography, skills, experience and creative philosophy of Hamidu Ibrahim.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ceo,
});

function Section({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-muted-foreground">{body}</p>
    </section>
  );
}

function Ceo() {
  const { t, pick } = useI18n();
  const ceo = useQuery(ceoQuery());
  const p = ceo.data;
  const subtitle = p ? pick(p.position_en, p.position_sw) : "";

  return (
    <SiteShell>
      <PageHeader eyebrow={t("ceo.title")} title={p?.name ?? BRAND.ceo} subtitle={subtitle} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {ceo.isLoading ? (
          <Spinner label={t("common.loading")} />
        ) : ceo.isError ? (
          <ErrorState />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                {p?.photo_url ? (
                  <img
                    src={p.photo_url as string}
                    alt={(p.name as string) ?? BRAND.ceo}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted-foreground">
                    {BRAND.ceo}
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {p?.cv_url && (
                  <Button asChild variant="outline">
                    <a href={p.cv_url as string} target="_blank" rel="noreferrer noopener">
                      <Download className="mr-1.5 h-4 w-4" /> {t("cta.downloadCv")}
                    </a>
                  </Button>
                )}
                <Button asChild>
                  <a
                    href={whatsappLink(`Hello ${BRAND.ceo}, I saw your profile on the Midnight Graphics website.`)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> {t("cta.whatsapp")}
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <Section title={t("ceo.bio")} body={p ? pick(p.bio_en, p.bio_sw) : null} />
              {(p?.skills as string[] | null)?.length ? (
                <section className="mt-8">
                  <h2 className="text-lg font-semibold">{t("ceo.skills")}</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {(p!.skills as string[]).map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-sm"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <Section title={t("ceo.experience")} body={p ? pick(p.experience_en, p.experience_sw) : null} />
              <Section title={t("ceo.philosophy")} body={p ? pick(p.philosophy_en, p.philosophy_sw) : null} />

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/request">{t("cta.request")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/portfolio">{t("cta.explore")}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
