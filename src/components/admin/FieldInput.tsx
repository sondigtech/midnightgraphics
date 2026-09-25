import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { uploadFile, validateFile } from "@/lib/storage";
import type { Field } from "./config";

type Props = { field: Field; value: any; onChange: (v: any) => void };

export function FieldInput({ field, value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const id = `f-${field.key}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {field.type === "textarea" ? (
        <Textarea id={id} rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "list" ? (
        <Textarea
          id={id}
          rows={4}
          value={Array.isArray(value) ? value.join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "image" ? (
        <div className="flex items-center gap-3">
          {value ? (
            <img src={value} alt="" className="h-16 w-16 rounded-md border border-border object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-md border border-dashed border-border" />
          )}
          <Input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const err = validateFile(file, { imagesOnly: true });
              if (err) return void toast.error(err);
              setBusy(true);
              try {
                const stored = await uploadFile(file, "admin");
                onChange(stored.url);
                toast.success("Image uploaded");
              } catch (x: any) {
                toast.error(x?.message ?? "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={value ?? ""}
          onChange={(e) =>
            onChange(field.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)
          }
        />
      )}
    </div>
  );
}

export function cleanPayload(fields: Field[], form: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const f of fields) {
    let v = form[f.key];
    if (f.type === "list") v = (Array.isArray(v) ? v : []).map((s: string) => s.trim()).filter(Boolean);
    if ((f.type === "text" || f.type === "textarea" || f.type === "date") && v === "") v = null;
    if (v !== undefined) out[f.key] = v;
  }
  return out;
}
