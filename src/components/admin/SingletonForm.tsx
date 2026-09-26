import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FieldInput, type Field } from "./CrudManager";

export function SingletonForm({ table, title, fields, invalidate }: { table: string; title: string; fields: Field[]; invalidate: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)(table).select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data ?? { id: 1 }) as Record<string, any>;
    },
  });
  const [values, setValues] = useState<Record<string, any>>({});
  useEffect(() => { if (q.data) setValues(q.data); }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as any)(table).upsert({ ...values, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      void qc.invalidateQueries({ queryKey: ["admin", table] });
      void qc.invalidateQueries({ queryKey: [invalidate] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
        {fields.map((f) => (
          <FieldInput key={f.key} field={f} folder={table} value={values[f.key]} onChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))} />
        ))}
      </div>
      <Button disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save changes
      </Button>
    </div>
  );
}
