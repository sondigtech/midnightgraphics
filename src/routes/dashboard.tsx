import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { BookOpen, CheckCircle2, Clock, Loader2, LogOut, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatMoney, whatsappLink } from "@/lib/brand";
import { activeUntil, mySubsQuery, tutorialPriceQuery, tutorialsQuery } from "@/lib/tutorials";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Student Dashboard | Midnight Graphics Enterprises" },
      { name: "description", content: "Your Midnight Graphics student portal: tutorials, enrollment and payments." },
      { property: "og:title", content: "Student Dashboard | Midnight Graphics" },
      { property: "og:description", content: "Learn design with Midnight Graphics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const subs = useQuery(mySubsQuery(user.id));
  const price = useQuery(tutorialPriceQuery);
  const tutorials = useQuery(tutorialsQuery);
  const until = activeUntil(subs.data ?? []);
  const pending = subs.data?.some((s) => s.status === "pending");
  const [form, setForm] = useState({ full_name: "", phone: "", payment_method: "M-Pesa", payment_reference: "" });

  const enroll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("student_subscriptions").insert({ ...form, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment submitted. We'll activate your access after verifying it.");
      setForm({ ...form, payment_reference: "" });
      void qc.invalidateQueries({ queryKey: ["my-subs"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) return toast.error("Enter your full name");
    if (form.phone.trim().length < 9) return toast.error("Enter a valid phone number");
    if (form.payment_reference.trim().length < 4) return toast.error("Enter the transaction reference");
    enroll.mutate();
  };

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const amount = formatMoney(price.data?.price ?? 50000);

  return (
    <SiteShell>
      <section className="surface-midnight">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-12 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Student Portal</p>
            <h1 className="mt-2 text-3xl font-bold">Karibu, {user.email}</h1>
          </div>
          <Button variant="secondary" onClick={() => void signOut()}><LogOut className="mr-1 h-4 w-4" />Sign out</Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-1">
          <h2 className="font-semibold">My access</h2>
          {until ? (
            <div className="mt-3 space-y-1">
              <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>
              <p className="text-sm text-muted-foreground">Access until {until.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-1">
              <Badge variant="secondary">{pending ? "Payment being verified" : "Not enrolled"}</Badge>
              <p className="text-sm text-muted-foreground">Plan: {amount} / month (30 days full access).</p>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-semibold">{until ? "Renew / extend access" : "Enroll now"} — {amount} / month</h2>
          <p className="text-sm text-muted-foreground">{price.data?.instructions}</p>
          {price.data?.whatsapp && (
            <a href={whatsappLink(`Hello, I want to pay ${amount} for the Midnight Graphics student plan. Email: ${user.email}`)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent">Get payment number on WhatsApp →</a>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="fn">Full name</Label><Input id="fn" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="ph">Phone</Label><Input id="ph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" /></div>
            <div className="space-y-1.5"><Label htmlFor="pm">Payment method</Label>
              <select id="pm" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                {["M-Pesa", "Tigo Pesa / Mixx", "Airtel Money", "HaloPesa", "Bank"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="rf">Transaction reference</Label><Input id="rf" value={form.payment_reference} onChange={(e) => setForm({ ...form, payment_reference: e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={enroll.isPending}>{enroll.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Submit payment</Button>
        </form>

        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" />My tutorials</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(tutorials.data ?? []).map((t) => (
              <Link key={t.id} to="/tutorials/$id" params={{ id: t.id }} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-secondary">
                <PlayCircle className="h-8 w-8 shrink-0 text-accent" />
                <div><p className="font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{until ? "Full access" : `Preview ${t.preview_seconds}s`}</p></div>
              </Link>
            ))}
            {!tutorials.data?.length && <p className="text-sm text-muted-foreground">Tutorials will appear here soon.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" />Payment history</h2>
          {!subs.data?.length ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr><th className="py-2">Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th><th>Expires</th></tr></thead>
              <tbody>{subs.data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>{formatMoney(Number(s.amount ?? 0))}</td><td>{s.payment_method}</td><td>{s.payment_reference}</td>
                  <td><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></td>
                  <td>{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</td>
                </tr>))}</tbody>
            </table></div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
