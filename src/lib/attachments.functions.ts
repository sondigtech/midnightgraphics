import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({ name: z.string().min(1).max(200), size: z.number().int().positive().max(10 * 1024 * 1024) });

// Public: lets visitors upload one request attachment via a one-time signed upload link.
export const createAttachmentUpload = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = data.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
    const path = `attachments/${crypto.randomUUID()}-${safe}`;
    const { data: signed, error } = await supabaseAdmin.storage.from("media").createSignedUploadUrl(path);
    if (error || !signed) throw new Error("Could not prepare upload");
    return { path, token: signed.token };
  });
