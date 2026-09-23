import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Clock, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Contact Midnight Graphics Enterprises in Tanzania by email, WhatsApp or the contact form for design, printing and digital technology projects.",
      },
      { property: "og:title", content: "Contact | Midnight Graphics Enterprises" },
      {
        property: "og:description",
        content: "Tell us about your project and we will reply shortly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = t("form.required");
    if (!form.email.trim()) next.email = t("form.required");
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t("form.invalidEmail");
    if (!form.message.trim()) next.message = t("form.required");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });
    setSending(false);

    if (error) {
      toast.error(t("form.error"));
      return;
    }
    toast.success(t("form.successMessage"));
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <SiteShell>
      <PageHeader eyebrow={t("nav.contact")} title={t("contact.title")} subtitle={t("contact.subtitle")} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name">{t("form.name")}</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={set("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "c-name-err" : undefined}
                className="mt-1.5"
              />
              {errors.name && (
                <p id="c-name-err" className="mt-1 text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="c-email">{t("form.email")}</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "c-email-err" : undefined}
                className="mt-1.5"
              />
              {errors.email && (
                <p id="c-email-err" className="mt-1 text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="c-phone">
                {t("form.phone")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="c-phone" value={form.phone} onChange={set("phone")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="c-subject">
                {t("form.subject")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="c-subject" value={form.subject} onChange={set("subject")} className="mt-1.5" />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="c-message">{t("form.message")}</Label>
            <Textarea
              id="c-message"
              rows={6}
              value={form.message}
              onChange={set("message")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "c-message-err" : undefined}
              className="mt-1.5"
            />
            {errors.message && (
              <p id="c-message-err" className="mt-1 text-xs text-destructive">
                {errors.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={sending} className="mt-6 w-full sm:w-auto">
            {sending ? t("form.sending") : t("form.send")}
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">{t("footer.contact")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${BRAND.email}`} className="break-all hover:text-accent">
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a
                  href={whatsappLink(`Hello ${BRAND.shortName}, I have a project enquiry.`)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent"
                >
                  {BRAND.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={BRAND.instagram} target="_blank" rel="noreferrer noopener" className="hover:text-accent">
                  Instagram
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Tanzania
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Mon - Sat, 08:00 - 20:00 EAT
              </li>
            </ul>
          </div>
          <Button asChild variant="outline" className="w-full">
            <a
              href={whatsappLink(`Hello ${BRAND.shortName}, I would like to request a service.`)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t("cta.whatsapp")}
            </a>
          </Button>
        </aside>
      </div>
    </SiteShell>
  );
}
