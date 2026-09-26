import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO_URL } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | Midnight Graphics Enterprises" },
      { name: "description", content: "Secure sign in for the Midnight Graphics Enterprises team." },
      { property: "og:title", content: "Admin Sign In | Midnight Graphics Enterprises" },
      { property: "og:description", content: "Secure sign in for the Midnight Graphics team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await supabase.rpc("claim_admin");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        toast.success("Check your email to confirm your account, then sign in.");
        setMode("in");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={LOGO_URL} alt="Midnight Graphics" className="h-16 w-16 rounded-full" />
          <h1 className="text-xl font-bold">{mode === "in" ? "Admin sign in" : "Create account"}</h1>
          <p className="text-sm text-muted-foreground">Only approved team emails get admin access.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}
        </Button>
        <div className="flex justify-between text-sm">
          <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Create account" : "I have an account"}
          </button>
          {mode === "in" && <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => void reset()}>Forgot password?</button>}
        </div>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to website</Link>
      </form>
    </div>
  );
}
