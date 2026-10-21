import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkMobilePayment, startMobilePayment } from "@/lib/payments.functions";

export function MobilePay({ amount }: { amount: string | null }) {
  const start = useServerFn(startMobilePayment);
  const check = useServerFn(checkMobilePayment);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) return;
    let tries = 0;
    const iv = setInterval(async () => {
      tries++;
      try {
        const r = await check({ data: { reference: ref } });
        if (r.status === "active") { toast.success("Payment received! Full access is now active."); setRef(null); void qc.invalidateQueries({ queryKey: ["my-subs"] }); }
        else if (r.status === "failed") { toast.error("Payment failed or was cancelled."); setRef(null); void qc.invalidateQueries({ queryKey: ["my-subs"] }); }
      } catch { /* keep waiting */ }
      if (tries >= 36) { setRef(null); toast.info("Still waiting for confirmation. Your access will activate once payment is confirmed."); }
    }, 5000);
    return () => clearInterval(iv);
  }, [ref, check, qc]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await start({ data: { full_name: name, phone } });
      if (r.error) toast.error(r.error);
      else { setRef(r.reference); toast.success("Check your phone and enter your PIN to pay."); }
    } catch { toast.error("Enter your full name and a valid phone number."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-2xl border border-accent/40 bg-card p-6 lg:col-span-3">
      <h2 className="flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4 text-accent" />Pay instantly with mobile money — {amount} / month</h2>
      <p className="text-sm text-muted-foreground">M-Pesa, Mixx by Yas (Tigo Pesa), Airtel Money, HaloPesa. You'll get a prompt on your phone — enter your PIN and access opens automatically.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="mp-n">Full name</Label><Input id="mp-n" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="mp-p">Mobile money number</Label><Input id="mp-p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" /></div>
      </div>
      <Button type="submit" disabled={busy || !!ref}>
        {(busy || ref) && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {ref ? "Waiting for your PIN confirmation..." : "Pay now"}
      </Button>
    </form>
  );
}
