import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password | Midnight Graphics Enterprises" },
      { name: "description", content: "Choose a new password for your Midnight Graphics account." },
      { property: "og:title", content: "Set New Password | Midnight Graphics" },
      { property: "og:description", content: "Choose a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8) return void toast.error("Password must be at least 8 characters");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) return void toast.error(error.message);
          toast.success("Password updated");
          void navigate({ to: "/admin" });
        }}
      >
        <h1 className="text-xl font-bold">Set a new password</h1>
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
