import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/activity")({ component: ActivityLog });

const ENTITY_LABEL: Record<string, string> = {
  portfolio: "Portfolio", services: "Service", packages: "Package",
  site_settings: "Site settings", ceo_profile: "CEO profile", service_requests: "Service request",
};

function ActivityLog() {
  const [user, setUser] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [entity, setEntity] = useState("");

  const users = useQuery({
    queryKey: ["admin", "activity-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log").select("user_email").not("user_email", "is", null).limit(1000);
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((d) => d.user_email as string))).sort();
    },
  });

  const log = useQuery({
    queryKey: ["admin", "activity", user, from, to, entity],
    queryFn: async () => {
      let q = supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(300);
      if (user) q = q.eq("user_email", user);
      if (entity) q = q.eq("entity", entity);
      if (from) q = q.gte("created_at", new Date(from + "T00:00:00").toISOString());
      if (to) q = q.lte("created_at", new Date(to + "T23:59:59.999").toISOString());
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5"><Label>User</Label>
          <select className={sel} value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="">All users</option>
            {users.data?.map((u) => <option key={u} value={u}>{u}</option>)}
          </select></div>
        <div className="space-y-1.5"><Label>Section</Label>
          <select className={sel} value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">All sections</option>
            {Object.entries(ENTITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="space-y-1.5"><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => { setUser(""); setFrom(""); setTo(""); setEntity(""); }}>Clear filters</Button></div>
      </div>

      {log.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : log.isError ? (
        <p className="text-destructive">Could not load activity: {(log.error as Error).message}</p>
      ) : !log.data?.length ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No activity found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">User</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Section</th><th className="px-3 py-2">Item</th><th className="px-3 py-2">Details</th></tr>
            </thead>
            <tbody>
              {log.data.map((r) => {
                const d = (r.details ?? {}) as { from?: string; to?: string; fields?: string[] };
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{r.user_email ?? "System"}</td>
                    <td className="px-3 py-2"><Badge variant="secondary">{r.action.replace("_", " ")}</Badge></td>
                    <td className="px-3 py-2">{ENTITY_LABEL[r.entity] ?? r.entity}</td>
                    <td className="max-w-[16rem] truncate px-3 py-2">{r.entity_label ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {d.from || d.to ? `${d.from ?? "—"} → ${d.to ?? "—"}` : d.fields?.length ? d.fields.join(", ") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
