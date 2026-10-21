import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ goal: z.string().trim().min(5).max(1000) });

export const createStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: tutorials }, { data: progress }, { data: active }] = await Promise.all([
      supabase.rpc("list_tutorials"),
      supabase.from("tutorial_progress").select("tutorial_id, completed, position_seconds").eq("user_id", userId),
      supabase.rpc("has_active_subscription", { _user_id: userId }),
    ]);
    const done = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.tutorial_id));
    const started = new Set((progress ?? []).map((p) => p.tutorial_id));
    const catalog = (tutorials ?? []).map((t) =>
      `- ${t.title} [${t.category ?? "General"}${t.duration ? `, ${t.duration}` : ""}] — ${done.has(t.id) ? "COMPLETED" : started.has(t.id) ? "IN PROGRESS" : "NOT STARTED"}${t.description ? `: ${t.description}` : ""}`,
    ).join("\n") || "(no tutorials published yet)";

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured.", plan: null };

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system:
          "You are a friendly study coach for Midnight Graphics Enterprises, a Tanzanian design school. Write a personalized weekly study plan in Markdown. Prioritize tutorials from the catalog that match the student's goal; skip completed ones, finish in-progress ones first. Use short headings per week, bullet lists, and practical exercises. If the catalog lacks something, suggest free practice ideas. Reply in the same language the student writes in (English or Swahili). Keep it under 400 words.",
        prompt: `Student goal:\n${data.goal}\n\nSubscription: ${active ? "ACTIVE (full access)" : "NOT ACTIVE (previews only — mention the 50,000 TZS/month plan once)"}\n\nTutorial catalog with this student's progress:\n${catalog}`,
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      const plan = await result.text;
      if (!plan.trim()) return { error: "The AI could not create a plan. Please try again later.", plan: null };
      return { error: null, plan };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("study plan error", status, e);
      if (status === 429) return { error: "Too many requests right now. Please try again in a minute.", plan: null };
      if (status === 402 || status === 403) return { error: "AI study plans are temporarily unavailable.", plan: null };
      return { error: "Something went wrong creating your plan.", plan: null };
    }
  });
