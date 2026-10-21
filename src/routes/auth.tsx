import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LOGO_URL } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Portal Sign In | Midnight Graphics Enterprises" },
      { name: "description", content: "Sign in or create your Midnight Graphics student account to access tutorials and your dashboard." },
      { property: "og:title", content: "Student Portal | Midnight Graphics Enterprises" },
      { property: "og:description", content: "Sign in or create your student account to start learning design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function friendly(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email au password si sahihi. / Wrong email or password.";
  if (m.includes("not confirmed")) return "Thibitisha email yako kwanza (angalia inbox/spam). / Please confirm your email first.";
  if (m.includes("already registered")) return "Email hii tayari ina account — ingia (Sign in). / Account exists, please sign in.";
  return msg;
}

async function goHome(navigate: ReturnType<typeof useNavigate>) {
  await supabase.rpc("claim_admin");
  const { data: u } = await supabase.auth.getUser();
  const { data: adm } = await supabase.rpc("has_role", { _user_id: u.user?.id ?? "", _role: "admin" });
  navigate({ to: adm ? "/admin" : "/dashboard", replace: true });
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { if (data.session) void goHome(navigate); });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (mode === "up" && name.trim().length < 2) { toast.error("Andika jina lako kamili / Enter your full name"); return; }
    if (!/^\S+@\S+\.\S+$/.test(em)) { toast.error("Weka email sahihi / Enter a valid email"); return; }
    if (password.length < 8) { toast.error("Password iwe na herufi 8 au zaidi / At least 8 characters"); return; }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password });
        if (error) throw error;
        toast.success("Karibu! / Welcome back");
        await goHome(navigate);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: em, password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) { toast.success("Account imeundwa! / Account created"); await goHome(navigate); }
        else { toast.success("Account imeundwa. Thibitisha email yako kisha uingie. / Check your email to confirm, then sign in."); setMode("in"); }
      }
    } catch (err) {
      toast.error(friendly((err as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email) { toast.error("Weka email kwanza / Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(friendly(error.message));
    else toast.success("Link ya kubadili password imetumwa. / Reset link sent.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center surface-midnight px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-elegant">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={LOGO_URL} alt="Midnight Graphics" className="h-16 w-16 rounded-full" />
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><GraduationCap className="h-4 w-4" />Student Portal</p>
          <h1 className="text-xl font-bold">{mode === "in" ? "Ingia / Sign in" : "Fungua Account / Create account"}</h1>
          <p className="text-sm text-muted-foreground">{mode === "in" ? "Ingia kuendelea kujifunza kwenye dashboard yako." : "Jisajili bure, kisha jiunge na kozi kwa TZS 50,000 / mwezi."}</p>
        </div>
        <div className="grid grid-cols-2 rounded-lg bg-secondary p-1 text-sm">
          {(["in", "up"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-md py-1.5 font-medium ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {m === "in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        {mode === "up" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Jina kamili / Full name</Label>
            <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" defaultVisible autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{mode === "in" ? "Ingia / Sign in" : "Fungua account"}
        </Button>
        {mode === "in" && (
          <button type="button" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => void reset()}>Umesahau password? / Forgot password?</button>
        )}
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Rudi kwenye website</Link>
      </form>
    </div>
  );
}
