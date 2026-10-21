import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StartInput = z.object({ full_name: z.string().trim().min(2).max(120), phone: z.string().trim().min(9).max(20) });

export const startMobilePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StartInput.parse(d))
  .handler(async ({ data, context }) => {
    const cp = await import("./clickpesa.server");
    if (!cp.clickpesaConfigured()) return { error: "Automatic mobile money is not set up yet. Please use manual payment below.", reference: null };
    const phone = cp.normalisePhone(data.phone);
    if (!phone) return { error: "Enter a valid Tanzanian phone number, e.g. 0712 345 678.", reference: null };
    const reference = `MG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    // Amount is set by the database from site settings — never from the browser.
    const { data: sub, error } = await context.supabase.from("student_subscriptions")
      .insert({ user_id: context.userId, full_name: data.full_name, phone, payment_method: "Mobile Money (ClickPesa)", payment_reference: reference })
      .select("amount").single();
    if (error || !sub) return { error: "Could not start payment.", reference: null };
    try {
      await cp.initiateUssdPush({ amount: Number(sub.amount), orderReference: reference, phoneNumber: phone });
    } catch (e) {
      console.error(e);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("student_subscriptions").update({ status: "failed", admin_notes: "USSD push failed" }).eq("payment_reference", reference);
      return { error: "Could not send the payment prompt to your phone. Please try again.", reference: null };
    }
    return { error: null, reference };
  });

export const checkMobilePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reference: z.string().min(4).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: own } = await context.supabase.from("student_subscriptions").select("id").eq("payment_reference", data.reference).eq("user_id", context.userId).maybeSingle();
    if (!own) return { status: "unknown" };
    const cp = await import("./clickpesa.server");
    return { status: await cp.verifyAndActivate(data.reference) };
  });
