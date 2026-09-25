import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { denied?: string } => (s["denied"] ? { denied: String(s["denied"]) } : {}),
  head: () => ({
    meta: [
      { title: "Admin Login | Midnight Graphics Enterprises" },
      { name: "description", content: "Secure sign-in for the Midnight Graphics Enterprises admin team." },
      { property: "og:title", content: "Admin Login | Midnight Graphics Enterprises" },
      { property: "og:description", content: "Secure sign-in for the admin team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { denied } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return void toast.error("Enter a valid email");
    if (mode !== "reset" && password.length < 8) return void toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Check your email for a reset link.");
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/login` } });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/admin" });
      }
    } catch (x: any) {
      toast.error(x?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <img src={LOGO_URL} alt="Midnight Graphics" className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-4 text-center text-xl font-bold">
          {mode === "in" ? "Admin sign in" : mode === "up" ? "Create admin account" : "Reset password"}
        </h1>
        {denied && (
          <p role="alert" className="mt-3 rounded-md bg-destructive/10 p-2 text-center text-sm text-destructive">
            This account does not have admin access.
          </p>
        )}
        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait..." : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
          </Button>
        </div>
        <div className="mt-4 flex justify-between text-xs">
          <button type="button" className="text-accent hover:underline" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "Have an account? Sign in" : "First time? Create account"}
          </button>
          <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("reset")}>
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}
