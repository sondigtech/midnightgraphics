import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requestResponseInput, requireRequestAdmin } from "./request-response";

export const respondToRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => requestResponseInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError) throw roleError;
    requireRequestAdmin(isAdmin);
    const { data: request, error: readError } = await context.supabase.from("service_requests").select("*").eq("id", data.id).single();
    if (readError) throw readError;
    let response = request;
    if (data.retry) {
      if (request.status !== data.decision || !request.response_id) throw new Error("Hakuna jibu hili la kutuma tena.");
    } else {
      const update = context.supabase.from("service_requests").update({
        status: data.decision, client_response: data.message || null, response_id: crypto.randomUUID(),
      }).eq("id", data.id);
      const guarded = request.response_id ? update.eq("response_id", request.response_id) : update.is("response_id", null);
      const { data: saved, error: saveError } = await guarded.select("*").single();
      if (saveError) throw new Error("Ombi limebadilishwa au halikuhifadhiwa. Pakia tena kabla ya kujaribu.");
      response = saved;
    }
    try {
      const { sendTemplateEmail } = await import("./email-templates/send-email");
      const result = await sendTemplateEmail("request-decision", response.email, {
        templateData: { name: response.full_name, service: response.service, decision: response.status, message: response.client_response || "" },
        idempotencyKey: `request-decision-${response.response_id}`,
      });
      return { email: result.sent ? "sent" as const : "suppressed" as const, error: null };
    } catch (error) {
      console.error("Request decision email failed", error);
      return { email: "failed" as const, error: "Jibu limehifadhiwa, lakini email haijatumwa. Tumia Retry email au WhatsApp." };
    }
  });