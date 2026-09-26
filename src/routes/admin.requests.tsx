import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestsQuery, type ServiceRequest } from "@/lib/data";
import { REQUEST_STATUSES, whatsappLink } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";

export const Route = createFileRoute("/admin/requests")({ component: Requests });

function Requests() {
  const qc = useQueryClient();
  const list = useQuery(requestsQuery());
  const [filter, setFilter] = useState<string>("all");
  const [del, setDel] = useState<ServiceRequest | null>(null);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["service_requests"] });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Pick<ServiceRequest, "status" | "admin_notes">> }) => {
      const { error } = await supabase.from("service_requests").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); setDel(null); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (list.data ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Service Requests</h1>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      {list.isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No requests.</p>
      ) : rows.map((r) => (
        <article key={r.id} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">{r.full_name} {r.company && <span className="text-muted-foreground">· {r.company}</span>}</h2>
              <p className="text-sm text-muted-foreground">{r.email}{r.phone && ` · ${r.phone}`} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <Badge variant={r.status === "new" ? "default" : "secondary"}>{r.status.replace("_", " ")}</Badge>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div><dt className="text-muted-foreground">Service</dt><dd>{r.service ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Budget</dt><dd>{r.budget ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Deadline</dt><dd>{r.deadline ?? "—"}</dd></div>
          </dl>
          {r.description && <p className="whitespace-pre-wrap text-sm">{r.description}</p>}
          {r.extra_info && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.extra_info}</p>}
          {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-accent underline">View attachment</a>}
          <Textarea placeholder="Admin notes" defaultValue={r.admin_notes ?? ""} rows={2}
            onBlur={(e) => e.target.value !== (r.admin_notes ?? "") && update.mutate({ id: r.id, values: { admin_notes: e.target.value } })} />
          <div className="flex flex-wrap gap-2">
            <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={r.status}
              onChange={(e) => update.mutate({ id: r.id, values: { status: e.target.value as ServiceRequest["status"] } })}>
              {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            {(r.whatsapp || r.phone) && (
              <Button size="sm" variant="outline" asChild>
                <a href={whatsappLink(`Hello ${r.full_name}, about your request for ${r.service ?? "our services"}...`, (r.whatsapp || r.phone || "").replace(/\D/g, ""))} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild><a href={`mailto:${r.email}`}>Email</a></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDel(r)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
          </div>
        </article>
      ))}
      <ConfirmDelete open={!!del} onOpenChange={(o) => !o && setDel(null)} pending={remove.isPending} onConfirm={() => del && remove.mutate(del.id)} />
    </div>
  );
}
