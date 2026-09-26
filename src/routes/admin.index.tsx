import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Image, Inbox, Mail, MessageSquareQuote, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: Overview });

async function count(table: string, filter?: (q: any) => any) {
  let q = (supabase.from as any)(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function Overview() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [portfolio, services, packages, testimonials, newRequests, unread] = await Promise.all([
        count("portfolio", (q) => q.is("deleted_at", null)),
        count("services"),
        count("packages"),
        count("testimonials"),
        count("service_requests", (q) => q.eq("status", "new")),
        count("contact_messages", (q) => q.eq("is_read", false)),
      ]);
      const [{ data: reqs }, { data: msgs }] = await Promise.all([
        supabase.from("service_requests").select("id,full_name,service,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,subject,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return { portfolio, services, packages, testimonials, newRequests, unread, reqs: reqs ?? [], msgs: msgs ?? [] };
    },
  });

  const s = stats.data;
  const cards = [
    { label: "Portfolio projects", value: s?.portfolio, icon: Image, to: "/admin/portfolio" },
    { label: "Services", value: s?.services, icon: Briefcase, to: "/admin/services" },
    { label: "Packages", value: s?.packages, icon: Package, to: "/admin/packages" },
    { label: "Testimonials", value: s?.testimonials, icon: MessageSquareQuote, to: "/admin/testimonials" },
    { label: "New service requests", value: s?.newRequests, icon: Inbox, to: "/admin/requests" },
    { label: "Unread messages", value: s?.unread, icon: Mail, to: "/admin/messages" },
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {stats.isError && <p className="text-destructive">Could not load stats.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card-lift flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div className="rounded-lg bg-accent/15 p-3 text-accent"><c.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "…" : c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Recent title="Latest service requests" to="/admin/requests"
          items={(s?.reqs ?? []).map((r) => ({ id: r.id, a: r.full_name, b: r.service ?? "", d: r.created_at }))} />
        <Recent title="Latest contact messages" to="/admin/messages"
          items={(s?.msgs ?? []).map((m) => ({ id: m.id, a: m.name, b: m.subject ?? "", d: m.created_at }))} />
      </div>
    </div>
  );
}

function Recent({ title, to, items }: { title: string; to: "/admin/requests" | "/admin/messages"; items: { id: string; a: string; b: string; d: string }[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link to={to} className="text-sm text-accent">View all</Link>
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
        <ul className="divide-y divide-border text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2 py-2">
              <span className="truncate"><b>{i.a}</b> <span className="text-muted-foreground">{i.b}</span></span>
              <span className="shrink-0 text-muted-foreground">{new Date(i.d).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
