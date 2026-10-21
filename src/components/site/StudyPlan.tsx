import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createStudyPlan } from "@/lib/study-plan.functions";

export function StudyPlan() {
  const run = useServerFn(createStudyPlan);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (goal.trim().length < 5) { toast.error("Tell us a bit more about what you want to learn"); return; }
    setBusy(true);
    try {
      const res = await run({ data: { goal } });
      if (res.error) toast.error(res.error); else setPlan(res.plan);
    } catch { toast.error("Could not create your plan."); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
      <h2 className="mb-2 flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-accent" />My AI study plan</h2>
      <p className="mb-4 text-sm text-muted-foreground">Tell us what you want to learn (English or Swahili). We'll build a plan from your tutorials and progress.</p>
      <form onSubmit={(e) => void submit(e)} className="space-y-3">
        <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={1000} rows={3}
          placeholder="e.g. I want to design logos for small businesses in 4 weeks" />
        <Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{busy ? "Creating plan..." : "Create my plan"}</Button>
      </form>
      {plan && <div className="prose prose-sm mt-6 max-w-none text-foreground [&_h1]:text-lg [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-4 [&_ul]:list-disc"><ReactMarkdown>{plan}</ReactMarkdown></div>}
    </div>
  );
}
