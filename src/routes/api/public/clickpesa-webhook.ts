import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  data: z.object({ orderReference: z.string().min(4).max(40) }).passthrough().optional(),
  orderReference: z.string().min(4).max(40).optional(),
}).passthrough();

export const Route = createFileRoute("/api/public/clickpesa-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        const ref = parsed.success ? (parsed.data.data?.orderReference ?? parsed.data.orderReference) : undefined;
        if (!ref) return new Response("bad request", { status: 400 });
        // The webhook body is never trusted: we re-check the payment directly with ClickPesa.
        const { verifyAndActivate } = await import("@/lib/clickpesa.server");
        try {
          const status = await verifyAndActivate(ref);
          return Response.json({ ok: true, status });
        } catch (e) {
          console.error("clickpesa webhook", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
