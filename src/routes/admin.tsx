import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Briefcase, FileText, Image, Inbox, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Package, Settings, UserRound, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    await supabase.rpc("claim_admin");
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return { user: data.user, isAdmin: Boolean(isAdmin) };
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Midnight Graphics Enterprises" },
      { name: "description", content: "Manage the Midnight Graphics Enterprises website." },
      { property: "og:title", content: "Admin Dashboard | Midnight Graphics" },
      { property: "og:description", content: "Website management for Midnight Graphics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/portfolio", label: "Portfolio", icon: Image },
  { to: "/admin/services", label: "Services", icon: Briefcase },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/ceo", label: "CEO Profile", icon: UserRound },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/requests", label: "Service Requests", icon: Inbox },
  { to: "/admin/messages", label: "Contact Messages", icon: Mail },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { user, isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="text-xl font-bold">No admin access</h1>
          <p className="text-sm text-muted-foreground">{user.email} is signed in but is not an approved admin.</p>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <img src={LOGO_URL} alt="Midnight Graphics" className="h-10 w-10 rounded-full" />
        <span className="font-semibold">Midnight Admin</span>
      </Link>
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
          activeOptions={{ exact: "exact" in n }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 transition hover:bg-white/10 hover:opacity-100"
          activeProps={{ className: "bg-white/15 !opacity-100 font-medium" }}>
          <n.icon className="h-4 w-4" /> {n.label}
        </Link>
      ))}
      <button onClick={() => void signOut()} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 hover:bg-white/10">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="surface-midnight sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="surface-midnight relative h-full w-64">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </header>
        <main className={cn("p-4 sm:p-6 lg:p-8")}><Outlet /></main>
      </div>
    </div>
  );
}
