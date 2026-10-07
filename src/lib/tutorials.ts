import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const tutorialsQuery = queryOptions({
  queryKey: ["tutorials"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("list_tutorials");
    if (error) throw error;
    return data ?? [];
  },
});

export const tutorialPriceQuery = queryOptions({
  queryKey: ["tutorial-price"],
  queryFn: async () => {
    const { data } = await supabase.from("site_settings").select("tutorial_monthly_price, payment_instructions, whatsapp").eq("id", 1).maybeSingle();
    return {
      price: Number(data?.tutorial_monthly_price ?? 50000),
      instructions: data?.payment_instructions ?? "",
      whatsapp: data?.whatsapp ?? "",
    };
  },
});

export const mySubsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["my-subs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export function activeUntil(subs: { status: string; expires_at: string | null }[]) {
  const now = Date.now();
  const active = subs.filter((s) => s.status === "active" && s.expires_at && new Date(s.expires_at).getTime() > now);
  if (!active.length) return null;
  return new Date(Math.max(...active.map((s) => new Date(s.expires_at as string).getTime())));
}
