import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Mail, MessageCircle, Instagram, Clock, MapPin } from "lucide-react";
import { BRAND, LOGO_URL, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/services", key: "nav.services" },
  { to: "/packages", key: "nav.packages" },
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/ceo", key: "nav.ceo" },
  { to: "/contact", key: "nav.contact" },
] as const;

function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 bg-secondary/60 p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(["en", "sw"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 uppercase transition-colors",
            lang === l ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label={BRAND.name}>
          <img src={LOGO_URL} alt={`${BRAND.name} logo`} className="h-10 w-10 rounded-lg object-contain" />
          <span className="hidden text-sm font-bold leading-tight sm:block">
            Midnight
            <span className="block text-accent">Graphics</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle className="hidden sm:inline-flex" />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/request">{t("cta.request")}</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3">
              <LangToggle />
              <Button asChild size="sm" onClick={() => setOpen(false)}>
                <Link to="/request">{t("cta.request")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="surface-midnight mt-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-lg object-contain" />
            <p className="text-lg font-bold">{BRAND.name}</p>
          </div>
          <p className="mt-4 max-w-md text-sm text-midnight-foreground/70">{t("footer.tagline")}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={BRAND.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold transition-colors hover:bg-accent"
            >
              TT
            </a>
            <a
              href={whatsappLink(`Hello ${BRAND.shortName}, I would like to know more about your services.`)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">{t("footer.quickLinks")}</p>
          <ul className="mt-4 space-y-2 text-sm text-midnight-foreground/75">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-accent">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">{t("footer.contact")}</p>
          <ul className="mt-4 space-y-3 text-sm text-midnight-foreground/75">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${BRAND.email}`} className="break-all hover:text-accent">
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={whatsappLink("Hello Midnight Graphics")} target="_blank" rel="noreferrer noopener" className="hover:text-accent">
                {BRAND.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Tanzania
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Mon - Sat, 08:00 - 20:00 EAT
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-midnight-foreground/60">
        {t("footer.rights")}
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  const { t } = useI18n();
  return (
    <a
      href={whatsappLink(`Hello ${BRAND.shortName}, I would like to request a service.`)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t("cta.whatsapp")}
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="surface-midnight">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-midnight-foreground/75">{subtitle}</p>}
      </div>
    </section>
  );
}
