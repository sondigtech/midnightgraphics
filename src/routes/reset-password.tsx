import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Midnight Graphics Enterprises" },
      { name: "description", content: "Set a new password for your Midnight Graphics account." },
      { property: "og:title", content: "Reset Password | Midnight Graphics" },
      { property: "og:description", content: "Set a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const submit = async () => {
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/admin" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center surface-midnight px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 text-card-foreground">
        <h1 className="text-xl font-bold">Set a new password</h1>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
        <Button className="w-full" onClick={() => void submit()}>Update password</Button>
      </div>
    </div>
  );
}
