import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/site/states";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

const count = async (table: string, f?: (q: any) => any) => {
  let q = (supabase.from as any)(table).select("id", { count: "exact", head: true });
  if (f) q = f(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
};

function Overview() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [portfolio, services, packages, testimonials, newReq, allReq, unread] = await Promise.all([
        count("portfolio", (q) => q.is("deleted_at", null)),
        count("services"),
        count("packages", (q) => q.eq("published", true)),
        count("testimonials"),
        count("service_requests", (q) => q.eq("status", "new")),
        count("service_requests"),
        count("contact_messages", (q) => q.eq("is_read", false)),
      ]);
      const [{ data: reqs }, { data: msgs }] = await Promise.all([
        supabase.from("service_requests").select("id,full_name,service,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,subject,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return { portfolio, services, packages, testimonials, newReq, allReq, unread, reqs: reqs ?? [], msgs: msgs ?? [] };
    },
  });

  if (stats.isLoading || !stats.data) return <Spinner />;
  const s = stats.data;
  const cards: [string, number, string][] = [
    ["Portfolio projects", s.portfolio, "portfolio"],
    ["Services", s.services, "services"],
    ["Published packages", s.packages, "packages"],
    ["Testimonials", s.testimonials, "testimonials"],
    ["New service requests", s.newReq, "requests"],
    ["Total requests", s.allReq, "requests"],
    ["Unread messages", s.unread, "messages"],
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, n, section]) => (
          <Link key={label} to="/admin/$section" params={{ section }} className="card-lift rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{n}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Recent title="Latest service requests" section="requests" items={s.reqs.map((r) => [r.id, r.full_name, r.service ?? "", r.created_at])} />
        <Recent title="Latest messages" section="messages" items={s.msgs.map((m) => [m.id, m.name, m.subject ?? "", m.created_at])} />
      </div>
    </div>
  );
}

function Recent({ title, section, items }: { title: string; section: string; items: string[][] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link to="/admin/$section" params={{ section }} className="text-sm text-accent hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {items.map(([id, name, sub, at]) => (
            <li key={id} className="flex justify-between gap-3 py-2">
              <span className="truncate">
                <span className="font-medium">{name}</span> <span className="text-muted-foreground">{sub}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{new Date(at ?? "").toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
