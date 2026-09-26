import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, validateFile, type StoredFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete } from "./ConfirmDelete";

type Row = Record<string, any> & { id: string };

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "list" | "image" | "gallery" | "select" | "date";
  options?: readonly string[];
  required?: boolean;
  full?: boolean;
};

type Props = {
  table: string;
  title: string;
  fields: Field[];
  columns: { key: string; label: string; render?: (row: Row) => ReactNode }[];
  defaults?: Record<string, unknown>;
  publishKey?: string;
  softDelete?: boolean;
  invalidate?: string[];
};

export function CrudManager({ table, title, fields, columns, defaults = {}, publishKey = "published", softDelete, invalidate = [] }: Props) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const list = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = (supabase.from as any)(table).select("*");
      if (softDelete) q = q.is("deleted_at", null);
      const { data, error } = await q.order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    invalidate.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
  };

  const save = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { id, created_at: _c, ...rest } = values;
      for (const f of fields) {
        if (f.required && (rest[f.key] === undefined || rest[f.key] === null || rest[f.key] === "")) {
          throw new Error(`${f.label} is required`);
        }
        if (f.type === "number" && rest[f.key] === "") rest[f.key] = null;
        if (f.type === "date" && rest[f.key] === "") rest[f.key] = null;
      }
      if ("updated_at" in rest) rest["updated_at"] = new Date().toISOString();
      const q = id
        ? (supabase.from as any)(table).update(rest).eq("id", id)
        : (supabase.from as any)(table).insert({ ...rest, sort_order: rest["sort_order"] ?? (list.data?.length ?? 0) + 1 });
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await (supabase.from as any)(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const q = softDelete
        ? (supabase.from as any)(table).update({ deleted_at: new Date().toISOString() }).eq("id", row.id)
        : (supabase.from as any)(table).delete().eq("id", row.id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      setToDelete(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = async (index: number, dir: -1 | 1) => {
    const rows = list.data ?? [];
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    await Promise.all([
      patch.mutateAsync({ id: a.id, values: { sort_order: index + dir + 1 } }),
      patch.mutateAsync({ id: b.id, values: { sort_order: index + 1 } }),
    ]);
  };

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={() => setEditing({ ...defaults })}>
          <Plus className="mr-1 h-4 w-4" /> Add new
        </Button>
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : list.isError ? (
        <p className="text-destructive">Could not load data: {(list.error as Error).message}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Order</th>
                {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => void move(i, -1)} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === rows.length - 1} onClick={() => void move(i, 1)} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 align-middle">{c.render ? c.render(row) : String(row[c.key] ?? "—")}</td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {publishKey in row && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={row[publishKey] ? "Unpublish" : "Publish"}
                          onClick={() => patch.mutate({ id: row.id, values: { [publishKey]: !row[publishKey] } })}>
                          {row[publishKey] ? <Eye className="h-4 w-4 text-accent" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Edit" onClick={() => setEditing({ ...row })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Delete" onClick={() => setToDelete(row)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.["id"] ? "Edit" : "Add"} — {title}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing[f.key]} folder={table}
                  onChange={(v) => setEditing((prev) => ({ ...(prev ?? {}), [f.key]: v }))} />
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={save.isPending} onClick={() => editing && save.mutate(editing)}>
              {save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}
        pending={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete)} />
    </div>
  );
}

export function FieldInput({ field, value, onChange, folder }: { field: Field; value: any; onChange: (v: any) => void; folder: string }) {
  const [uploading, setUploading] = useState(false);
  const wide = field.full || ["textarea", "list", "gallery"].includes(field.type);

  const handleFiles = async (files: FileList | null, multiple: boolean) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const out: StoredFile[] = [];
      for (const file of Array.from(files)) {
        const err = validateFile(file, { imagesOnly: true });
        if (err) { toast.error(err); continue; }
        out.push(await uploadFile(file, folder));
      }
      if (multiple) onChange([...(Array.isArray(value) ? value : []), ...out]);
      else if (out[0]) onChange(out[0].url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  let control: ReactNode;
  switch (field.type) {
    case "textarea":
      control = <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = <Input type="number" min={0} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
      break;
    case "date":
      control = <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "boolean":
      control = <div className="pt-1"><Switch checked={!!value} onCheckedChange={onChange} /></div>;
      break;
    case "select":
      control = (
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case "list":
      control = (
        <Textarea rows={4} placeholder="One item per line" value={Array.isArray(value) ? value.join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trimStart()).filter((s, i, a) => s !== "" || i === a.length - 1))} />
      );
      break;
    case "image":
      control = (
        <div className="flex items-center gap-3">
          {value && <img src={value} alt="" className="h-16 w-16 rounded-md border border-border object-cover" />}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent/10">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleFiles(e.target.files, false)} />
          </label>
          {value && <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
        </div>
      );
      break;
    case "gallery": {
      const imgs: StoredFile[] = Array.isArray(value) ? value : [];
      control = (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {imgs.map((img, i) => (
              <div key={img.path ?? i} className="relative">
                <img src={img.url} alt="" className="h-20 w-20 rounded-md border border-border object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => onChange(imgs.filter((_, j) => j !== i))}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent/10">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Add images
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files, true)} />
          </label>
        </div>
      );
      break;
    }
    default:
      control = <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <div className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <Label>{field.label}{field.required && " *"}</Label>
      {control}
    </div>
  );
}

export const priceCell = (row: Row) =>
  row["price"] != null || row["price_from"] != null
    ? `${row["currency"] ?? "TZS"} ${Number(row["price"] ?? row["price_from"]).toLocaleString()}`
    : "—";

export const flagCell = (label: string) => (on: boolean) => (on ? <Badge variant="secondary">{label}</Badge> : null);
