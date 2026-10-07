import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/brand";

export const Route = createFileRoute("/admin/students")({ component: Students });

function Students() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_subscriptions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("student_subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); void qc.invalidateQueries({ queryKey: ["admin-subs"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const now = Date.now();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Students & Payments</h1>
      <p className="text-sm text-muted-foreground">Check the Mobile Money reference, then press Approve. Approval gives 30 days of full access.</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr className="[&>th]:p-3"><th>Date</th><th>Student</th><th>Phone</th><th>Amount</th><th>Method / Ref</th><th>Status</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {(list.data ?? []).map((s) => {
              const expired = s.status === "active" && s.expires_at && new Date(s.expires_at).getTime() < now;
              return (
                <tr key={s.id} className="border-t border-border [&>td]:p-3">
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td><div className="font-medium">{s.full_name}</div><div className="text-xs text-muted-foreground">{s.user_email}</div></td>
                  <td>{s.phone}</td>
                  <td>{formatMoney(Number(s.amount ?? 0))}</td>
                  <td>{s.payment_method}<div className="font-mono text-xs">{s.payment_reference}</div></td>
                  <td><Badge variant={s.status === "active" && !expired ? "default" : "secondary"}>{expired ? "expired" : s.status}</Badge></td>
                  <td>{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    {s.status === "pending" && <>
                      <Button size="sm" onClick={() => setStatus.mutate({ id: s.id, status: "active" })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: s.id, status: "rejected" })}>Reject</Button>
                    </>}
                  </td>
                </tr>
              );
            })}
            {!list.data?.length && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No student payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
