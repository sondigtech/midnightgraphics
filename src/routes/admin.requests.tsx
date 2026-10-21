import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, X, Mail, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestsQuery, type ServiceRequest } from "@/lib/data";
import { REQUEST_STATUSES, whatsappLink } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { respondToRequest } from "@/lib/request-responses.functions";
import { clientDecisionMessage, clientWhatsAppNumber } from "@/lib/request-response";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [
    { title: "Service Requests Admin | Midnight Graphics" },
    { name: "description", content: "Review work requests and send client decisions at Midnight Graphics Enterprises." },
    { property: "og:title", content: "Service Requests Admin | Midnight Graphics" },
    { property: "og:description", content: "Manage service requests and client responses." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Requests,
});

function Requests() {
  const qc = useQueryClient();
  const list = useQuery(requestsQuery());
  const [filter, setFilter] = useState<string>("all");
  const [del, setDel] = useState<ServiceRequest | null>(null);
  const [reply, setReply] = useState<{ request: ServiceRequest; decision: "approved" | "rejected" } | null>(null);
  const [message, setMessage] = useState("");
  const [emailResults, setEmailResults] = useState<Record<string, string>>({});
  const sendResponse = useServerFn(respondToRequest);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["service_requests"] });
  const respond = useMutation({
    mutationFn: (data: { id: string; decision: "approved" | "rejected"; message: string; retry: boolean }) => sendResponse({ data }),
    onSuccess: (result, data) => {
      setEmailResults((old) => ({ ...old, [data.id]: result.email }));
      if (result.email === "sent") toast.success("Jibu limehifadhiwa na email imetumwa.");
      else if (result.email === "suppressed") toast.warning("Jibu limehifadhiwa. Mteja huyu amezuiwa kupokea email; tumia WhatsApp.");
      else toast.error(result.error);
      setReply(null);
      refresh();
      void qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const openReply = (request: ServiceRequest, decision: "approved" | "rejected") => {
    setMessage(request.client_response || "");
    setReply({ request, decision });
  };

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
      {list.isError ? <p role="alert" className="text-destructive">{list.error.message}</p> : list.isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : rows.length === 0 ? (
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
          {r.client_response && <p className="whitespace-pre-wrap border-l-2 border-accent pl-3 text-sm"><span className="font-semibold">Jibu kwa mteja: </span>{r.client_response}</p>}
          {emailResults[r.id] && <p role="status" className="text-sm text-muted-foreground">{emailResults[r.id] === "sent" ? "Email imetumwa." : emailResults[r.id] === "suppressed" ? "Email imezuiwa kwa mteja huyu." : "Email haijatumwa — jaribu tena au tumia WhatsApp."}</p>}
          {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-accent underline">View attachment</a>}
          <Textarea placeholder="Admin notes" defaultValue={r.admin_notes ?? ""} rows={2}
            onBlur={(e) => e.target.value !== (r.admin_notes ?? "") && update.mutate({ id: r.id, values: { admin_notes: e.target.value } })} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={respond.isPending} onClick={() => openReply(r, "approved")}><Check className="mr-1 h-4 w-4" />Approve</Button>
            <Button size="sm" variant="outline" disabled={respond.isPending} onClick={() => openReply(r, "rejected")}><X className="mr-1 h-4 w-4" />Reject</Button>
            {r.response_id && (r.status === "approved" || r.status === "rejected") && (
              <Button size="sm" variant="outline" disabled={respond.isPending} onClick={() => respond.mutate({ id: r.id, decision: r.status as "approved" | "rejected", message: "", retry: true })}><Mail className="mr-1 h-4 w-4" />Retry email</Button>
            )}
            <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={r.status}
              disabled={respond.isPending || update.isPending}
              onChange={(e) => e.target.value === "approved" || e.target.value === "rejected" ? openReply(r, e.target.value) : update.mutate({ id: r.id, values: { status: e.target.value as ServiceRequest["status"] } })}>
              {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            {clientWhatsAppNumber(r.whatsapp) || clientWhatsAppNumber(r.phone) ? (
              <Button size="sm" variant="outline" asChild>
                <a href={whatsappLink(r.status === "approved" || r.status === "rejected" ? clientDecisionMessage(r.full_name, r.service, r.status, r.client_response || "") : `Hello ${r.full_name}, about your request for ${r.service ?? "our services"}...`, clientWhatsAppNumber(r.whatsapp) || clientWhatsAppNumber(r.phone) || "")} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            ) : null}
            <Button size="sm" variant="outline" asChild><a href={`mailto:${r.email}`}>Email</a></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDel(r)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
          </div>
        </article>
      ))}
      <ConfirmDelete open={!!del} onOpenChange={(o) => !o && setDel(null)} pending={remove.isPending} onConfirm={() => del && remove.mutate(del.id)} />
      <Dialog open={!!reply} onOpenChange={(open) => { if (!open && !respond.isPending) setReply(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reply?.decision === "approved" ? "Approve request" : "Reject request"}</DialogTitle>
            <DialogDescription>{reply?.request.full_name} · {reply?.request.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="client-response">Jibu kwa mteja (si lazima)</Label>
            <Textarea id="client-response" rows={4} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} disabled={respond.isPending} />
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={respond.isPending} onClick={() => setReply(null)}>Cancel</Button>
            <Button disabled={respond.isPending} onClick={() => reply && respond.mutate({ id: reply.request.id, decision: reply.decision, message, retry: false })}>
              {respond.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Mail className="mr-1 h-4 w-4" />}Save & send email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
