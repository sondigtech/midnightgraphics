import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, ErrorState, Spinner } from "@/components/site/states";
import { REQUEST_STATUSES, formatMoney } from "@/lib/brand";
import { FieldInput, cleanPayload } from "./FieldInput";
import type { InboxConfig, ResourceConfig, SingletonConfig } from "./config";

const db = (t: string) => (supabase.from as any)(t);

function ConfirmDelete({ onConfirm, label = "Delete" }: { onConfirm: () => void; label?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const qc = useQueryClient();
  const key = ["admin", config.table];
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const list = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = db(config.table).select("*");
      if (config.softDelete) q = q.is("deleted_at", null);
      const { data, error } = await q.order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Record<string, any>[];
    },
  });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: [config.table] });
  };

  const save = useMutation({
    mutationFn: async (form: Record<string, any>) => {
      const missing = config.fields.find((f) => f.required && !String(form[f.key] ?? "").trim());
      if (missing) throw new Error(`${missing.label} is required`);
      const payload = cleanPayload(config.fields, form);
      if (config.table === "packages") payload["updated_at"] = new Date().toISOString();
      const { error } = form["id"]
        ? await db(config.table).update(payload).eq("id", form["id"])
        : await db(config.table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save"),
  });

  const patch = async (id: string, values: Record<string, any>, msg: string) => {
    const { error } = await db(config.table).update(values).eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success(msg);
    refresh();
  };
  const remove = async (id: string) => {
    if (config.softDelete) return patch(id, { deleted_at: new Date().toISOString() }, "Deleted");
    const { error } = await db(config.table).delete().eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const newItem = () => {
    const blank: Record<string, any> = {};
    for (const f of config.fields) {
      if (f.type === "boolean") blank[f.key] = f.key === "published" || f.key === "available";
      if (f.type === "select") blank[f.key] = f.options?.[0];
      if (f.key === "sort_order") blank[f.key] = (list.data?.length ?? 0) + 1;
    }
    setEditing(blank);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <Button onClick={newItem}>
          <Plus className="mr-1 h-4 w-4" /> Add new
        </Button>
      </div>
      {list.isLoading ? (
        <Spinner />
      ) : list.isError ? (
        <ErrorState />
      ) : !list.data?.length ? (
        <EmptyState message="Nothing here yet. Add your first item." />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {list.data.map((row) => {
            const img = row["cover_url"] ?? row["image_url"] ?? row["photo_url"];
            const sub = config.subtitleKey === "price" ? formatMoney(row["price"], row["currency"] ?? "TZS") : row[config.subtitleKey ?? ""];
            const pub = config.publishKey ? Boolean(row[config.publishKey]) : true;
            return (
              <li key={row["id"]} className="flex items-center gap-3 p-3">
                {img ? (
                  <img src={img} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row[config.titleKey]}</p>
                  <p className="truncate text-xs text-muted-foreground">{sub ?? ""}</p>
                </div>
                <Badge variant={pub ? "default" : "secondary"} className="hidden sm:inline-flex">
                  {pub ? "Published" : "Hidden"}
                </Badge>
                {config.publishKey && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={pub ? "Unpublish" : "Publish"}
                    onClick={() => patch(row["id"], { [config.publishKey!]: !pub }, pub ? "Unpublished" : "Published")}
                  >
                    {pub ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing({ ...row })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDelete onConfirm={() => void remove(row["id"])} />
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? "Edit" : "Add"} {config.title.replace(/s$/, "")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              {config.fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={editing[f.key]}
                  onChange={(v) => setEditing((p) => ({ ...(p ?? {}), [f.key]: v }))}
                />
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SingletonEditor({ config }: { config: SingletonConfig }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const q = useQuery({
    queryKey: ["admin", config.table],
    queryFn: async () => {
      const { data, error } = await db(config.table).select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data ?? { id: 1 }) as Record<string, any>;
    },
  });
  useEffect(() => {
    if (q.data) setForm({ ...q.data });
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { id: 1, ...cleanPayload(config.fields, form ?? {}), updated_at: new Date().toISOString() };
      const { error } = await db(config.table).upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      void qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save"),
  });

  if (q.isLoading || !form) return <Spinner />;
  if (q.isError) return <ErrorState />;
  return (
    <form
      className="max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h1 className="mb-6 text-2xl font-bold">{config.title}</h1>
      <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
        {config.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...(p ?? {}), [f.key]: v }))} />
        ))}
        <Button type="submit" disabled={save.isPending} className="justify-self-start">
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function InboxManager({ config }: { config: InboxConfig }) {
  const qc = useQueryClient();
  const isReq = config.table === "service_requests";
  const key = ["admin", config.table];
  const [filter, setFilter] = useState("all");
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await db(config.table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Record<string, any>[];
    },
  });
  const patch = async (id: string, values: Record<string, any>, msg = "Updated") => {
    const { error } = await db(config.table).update(values).eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success(msg);
    void qc.invalidateQueries({ queryKey: key });
  };
  const remove = async (id: string) => {
    const { error } = await db(config.table).delete().eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Deleted");
    void qc.invalidateQueries({ queryKey: key });
  };

  const rows = (q.data ?? []).filter((r) =>
    filter === "all" ? true : isReq ? r["status"] === filter : filter === "unread" ? !r["is_read"] : r["is_read"],
  );
  const filters = isReq ? ["all", ...REQUEST_STATUSES] : ["all", "unread", "read"];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{config.title}</h1>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f.replace("_", " ")}
          </Button>
        ))}
      </div>
      {q.isLoading ? (
        <Spinner />
      ) : q.isError ? (
        <ErrorState />
      ) : !rows.length ? (
        <EmptyState message="No submissions here." />
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <article key={r["id"]} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {isReq ? r["full_name"] : r["name"]}
                    {!isReq && !r["is_read"] && <Badge className="ml-2">New</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(r["created_at"]).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isReq ? (
                    <select
                      aria-label="Status"
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={r["status"]}
                      onChange={(e) => void patch(r["id"], { status: e.target.value }, "Status updated")}
                    >
                      {REQUEST_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => void patch(r["id"], { is_read: !r["is_read"] })}>
                      Mark {r["is_read"] ? "unread" : "read"}
                    </Button>
                  )}
                  <ConfirmDelete onConfirm={() => void remove(r["id"])} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${r["email"]}`} className="inline-flex items-center gap-1 text-accent hover:underline">
                  <Mail className="h-4 w-4" /> {r["email"]}
                </a>
                {(r["phone"] || r["whatsapp"]) && (
                  <a
                    href={`https://wa.me/${String(r["whatsapp"] ?? r["phone"]).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <Phone className="h-4 w-4" /> {r["whatsapp"] ?? r["phone"]}
                  </a>
                )}
              </div>
              {isReq ? (
                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                  {[
                    ["Service", r["service"]],
                    ["Company", r["company"]],
                    ["Budget", r["budget"]],
                    ["Deadline", r["deadline"]],
                  ].map(([k, v]) =>
                    v ? (
                      <div key={k}>
                        <dt className="inline text-muted-foreground">{k}: </dt>
                        <dd className="inline">{v}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              ) : (
                r["subject"] && <p className="mt-3 text-sm font-medium">{r["subject"]}</p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {isReq ? [r["description"], r["extra_info"]].filter(Boolean).join("\n\n") : r["message"]}
              </p>
              {isReq && r["attachment_url"] && (
                <a href={r["attachment_url"]} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent hover:underline">
                  View attachment
                </a>
              )}
              {isReq && <NotesBox initial={r["admin_notes"] ?? ""} onSave={(v) => void patch(r["id"], { admin_notes: v }, "Notes saved")} />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesBox({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <Textarea rows={2} placeholder="Private admin notes" value={v} onChange={(e) => setV(e.target.value)} />
      <Button size="sm" variant="outline" onClick={() => onSave(v)} disabled={v === initial}>
        Save notes
      </Button>
    </div>
  );
}
