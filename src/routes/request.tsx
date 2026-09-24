import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { servicesQuery } from "@/lib/data";
import { uploadFile, validateFile } from "@/lib/storage";

export const Route = createFileRoute("/request")({
  validateSearch: (search: Record<string, unknown>): { service?: string } =>
    typeof search["service"] === "string" ? { service: search["service"] } : {},
  head: () => ({
    meta: [
      { title: "Request a Service | Midnight Graphics Enterprises" },
      {
        name: "description",
        content:
          "Submit a service request for graphic design, branding, printing, web or app development and receive a reply from Midnight Graphics Enterprises.",
      },
      { property: "og:title", content: "Request a Service | Midnight Graphics" },
      {
        property: "og:description",
        content: "Share your project brief, budget and deadline and we will get back to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RequestPage() {
  const { t, pick } = useI18n();
  const { service } = Route.useSearch();
  const services = useQuery(servicesQuery());

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    service: service ?? "",
    description: "",
    budget: "",
    deadline: "",
    company: "",
    extra_info: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.full_name.trim()) next.full_name = t("form.required");
    if (!form.email.trim()) next.email = t("form.required");
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t("form.invalidEmail");
    if (!form.service.trim()) next.service = t("form.required");
    if (!form.description.trim()) next.description = t("form.required");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    try {
      let attachment_url: string | null = null;
      if (file) {
        const invalid = validateFile(file);
        if (invalid) {
          setSending(false);
          toast.error(invalid);
          return;
        }
        attachment_url = (await uploadFile(file, "attachments")).url;
      }

      const { error } = await supabase.from("service_requests").insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        service: form.service,
        description: form.description.trim(),
        budget: form.budget.trim() || null,
        deadline: form.deadline || null,
        company: form.company.trim() || null,
        extra_info: form.extra_info.trim() || null,
        attachment_url,
      });
      if (error) throw error;

      toast.success(t("form.successRequest"));
      const summary = `Hello ${BRAND.shortName}!\nName: ${form.full_name}\nService: ${form.service}\nBudget: ${form.budget || "-"}\nDeadline: ${form.deadline || "-"}\nDetails: ${form.description}`;
      window.open(whatsappLink(summary), "_blank", "noopener");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        service: "",
        description: "",
        budget: "",
        deadline: "",
        company: "",
        extra_info: "",
      });
      setFile(null);
    } catch {
      toast.error(t("form.error"));
    } finally {
      setSending(false);
    }
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${key}-err`} className="mt-1 text-xs text-destructive">
        {errors[key]}
      </p>
    ) : null;

  return (
    <SiteShell>
      <PageHeader eyebrow={t("cta.request")} title={t("cta.request")} subtitle={t("contact.subtitle")} />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="r-name">{t("form.name")}</Label>
              <Input
                id="r-name"
                value={form.full_name}
                onChange={set("full_name")}
                aria-invalid={Boolean(errors.full_name)}
                aria-describedby={errors.full_name ? "full_name-err" : undefined}
                className="mt-1.5"
              />
              {fieldError("full_name")}
            </div>
            <div>
              <Label htmlFor="r-email">{t("form.email")}</Label>
              <Input
                id="r-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-err" : undefined}
                className="mt-1.5"
              />
              {fieldError("email")}
            </div>
            <div>
              <Label htmlFor="r-phone">
                {t("form.phone")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="r-phone" value={form.phone} onChange={set("phone")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="r-whatsapp">
                {t("form.whatsapp")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="r-whatsapp" value={form.whatsapp} onChange={set("whatsapp")} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="r-service">{t("form.service")}</Label>
              <select
                id="r-service"
                value={form.service}
                onChange={set("service")}
                aria-invalid={Boolean(errors.service)}
                aria-describedby={errors.service ? "service-err" : undefined}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {(services.data ?? []).map((s) => (
                  <option key={s.id} value={s.name_en}>
                    {pick(s.name_en, s.name_sw)}
                  </option>
                ))}
              </select>
              {fieldError("service")}
            </div>
            <div>
              <Label htmlFor="r-budget">
                {t("form.budget")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="r-budget" value={form.budget} onChange={set("budget")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="r-deadline">
                {t("form.deadline")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="r-deadline" type="date" value={form.deadline} onChange={set("deadline")} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="r-company">
                {t("form.company")} <span className="text-muted-foreground">({t("form.optional")})</span>
              </Label>
              <Input id="r-company" value={form.company} onChange={set("company")} className="mt-1.5" />
            </div>
          </div>

          <div className="mt-5">
            <Label htmlFor="r-description">{t("form.description")}</Label>
            <Textarea
              id="r-description"
              rows={6}
              value={form.description}
              onChange={set("description")}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-err" : undefined}
              className="mt-1.5"
            />
            {fieldError("description")}
          </div>

          <div className="mt-5">
            <Label htmlFor="r-extra">
              {t("form.extra")} <span className="text-muted-foreground">({t("form.optional")})</span>
            </Label>
            <Textarea id="r-extra" rows={3} value={form.extra_info} onChange={set("extra_info")} className="mt-1.5" />
          </div>

          <div className="mt-5">
            <Label htmlFor="r-file">
              {t("form.attachment")} <span className="text-muted-foreground">({t("form.optional")})</span>
            </Label>
            <Input
              id="r-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" disabled={sending} className="mt-6 w-full sm:w-auto">
            {sending ? t("form.sending") : t("form.submit")}
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}
