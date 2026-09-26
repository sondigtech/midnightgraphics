import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { messagesQuery, type ContactMessage } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";

export const Route = createFileRoute("/admin/messages")({ component: Messages });

function Messages() {
  const qc = useQueryClient();
  const list = useQuery(messagesQuery());
  const [del, setDel] = useState<ContactMessage | null>(null);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["contact_messages"] });

  const toggle = useMutation({
    mutationFn: async (m: ContactMessage) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: !m.is_read }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); setDel(null); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      {list.isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : (list.data ?? []).length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No messages.</p>
      ) : (list.data ?? []).map((m) => (
        <article key={m.id} className={`space-y-2 rounded-xl border bg-card p-5 ${m.is_read ? "border-border" : "border-accent"}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">{m.name} {m.subject && <span className="text-muted-foreground">· {m.subject}</span>}</h2>
              <p className="text-sm text-muted-foreground">{m.email}{m.phone && ` · ${m.phone}`} · {new Date(m.created_at).toLocaleString()}</p>
            </div>
            {!m.is_read && <Badge>Unread</Badge>}
          </div>
          <p className="whitespace-pre-wrap text-sm">{m.message}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toggle.mutate(m)}>Mark as {m.is_read ? "unread" : "read"}</Button>
            <Button size="sm" variant="outline" asChild><a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "Your message")}`}>Reply by email</a></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDel(m)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
          </div>
        </article>
      ))}
      <ConfirmDelete open={!!del} onOpenChange={(o) => !o && setDel(null)} pending={remove.isPending} onConfirm={() => del && remove.mutate(del.id)} />
    </div>
  );
}
