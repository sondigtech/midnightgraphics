// Server-only ClickPesa helpers (USSD push for M-Pesa, Tigo/Mixx, Airtel, HaloPesa).
const BASE = "https://api.clickpesa.com/third-parties";

export function clickpesaConfigured() {
  return !!process.env["CLICKPESA_CLIENT_ID"] && !!process.env["CLICKPESA_API_KEY"];
}

async function token() {
  const res = await fetch(`${BASE}/generate-token`, {
    method: "POST",
    headers: { "client-id": process.env["CLICKPESA_CLIENT_ID"]!, "api-key": process.env["CLICKPESA_API_KEY"]! },
  });
  const body = (await res.json().catch(() => ({}))) as { token?: string; message?: string };
  if (!res.ok || !body.token) throw new Error(`ClickPesa auth failed (${res.status}) ${body.message ?? ""}`);
  return body.token; // already "Bearer ..."
}

/** Normalises 07XX / +2557XX / 2557XX to 2557XXXXXXXX. */
export function normalisePhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("255") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return `255${d.slice(1)}`;
  if (d.length === 9) return `255${d}`;
  return null;
}

export async function initiateUssdPush(p: { amount: number; orderReference: string; phoneNumber: string }) {
  const res = await fetch(`${BASE}/payments/initiate-ussd-push-request`, {
    method: "POST",
    headers: { Authorization: await token(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: String(p.amount), currency: "TZS", orderReference: p.orderReference, phoneNumber: p.phoneNumber }),
  });
  const body = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(`ClickPesa push failed (${res.status}) ${body.message ?? ""}`);
  return body;
}

export type ClickPesaPayment = { status?: string; collectedAmount?: number | string; collectedCurrency?: string; orderReference?: string; id?: string };

/** Asks ClickPesa directly for the payment status — never trust a webhook body alone. */
export async function queryPayment(orderReference: string): Promise<ClickPesaPayment | null> {
  const res = await fetch(`${BASE}/payments/${encodeURIComponent(orderReference)}`, { headers: { Authorization: await token() } });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as ClickPesaPayment | ClickPesaPayment[] | null;
  return Array.isArray(body) ? (body[0] ?? null) : body;
}

/**
 * Verifies with ClickPesa and activates the matching subscription when paid in full.
 * Returns the resulting local status.
 */
export async function verifyAndActivate(orderReference: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: sub } = await supabaseAdmin
    .from("student_subscriptions").select("id, status, amount").eq("payment_reference", orderReference).maybeSingle();
  if (!sub) return "unknown";
  if (sub.status !== "pending") return sub.status;
  const pay = await queryPayment(orderReference);
  const st = (pay?.status ?? "").toUpperCase();
  if (st === "SUCCESS" || st === "SETTLED") {
    const paid = Number(pay?.collectedAmount ?? 0);
    const cur = (pay?.collectedCurrency ?? "TZS").toUpperCase();
    if (paid < Number(sub.amount ?? 0) || cur !== "TZS") {
      await supabaseAdmin.from("student_subscriptions").update({ admin_notes: `Amount mismatch: got ${paid} ${cur}` }).eq("id", sub.id);
      return "pending";
    }
    await supabaseAdmin.from("student_subscriptions").update({ status: "active", admin_notes: `Auto-verified ClickPesa ${pay?.id ?? ""}` }).eq("id", sub.id);
    return "active";
  }
  if (st === "FAILED" || st === "CANCELLED" || st === "REJECTED") {
    await supabaseAdmin.from("student_subscriptions").update({ status: "failed", admin_notes: `ClickPesa status ${st}` }).eq("id", sub.id);
    return "failed";
  }
  return "pending";
}
