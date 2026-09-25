import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Images,
  Sparkles,
  Package,
  UserRound,
  Inbox,
  Mail,
  Quote,
  Settings,
  LogOut,
  Menu,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin | Midnight Graphics" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
    await supabase.rpc("claim_admin");
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/login", search: { denied: "1" } });
    return { user: data.user };
  },
  component: AdminLayout,
});

const NAV = [
  { section: "", label: "Dashboard", icon: LayoutDashboard },
  { section: "portfolio", label: "Portfolio", icon: Images },
  { section: "services", label: "Services", icon: Sparkles },
  { section: "packages", label: "Packages", icon: Package },
  { section: "ceo", label: "CEO Profile", icon: UserRound },
  { section: "requests", label: "Service Requests", icon: Inbox },
  { section: "messages", label: "Contact Messages", icon: Mail },
  { section: "testimonials", label: "Testimonials", icon: Quote },
  { section: "settings", label: "Site Settings", icon: Settings },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ section, label, icon: Icon }) => {
        const cls = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent";
        const active = { className: "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" };
        const inner = (
          <>
            <Icon className="h-4 w-4" /> {label}
          </>
        );
        return section ? (
          <Link key={label} to="/admin/$section" params={{ section }} className={cls} activeProps={active} onClick={() => setOpen(false)}>
            {inner}
          </Link>
        ) : (
          <Link key={label} to="/admin" className={cls} activeOptions={{ exact: true }} activeProps={active} onClick={() => setOpen(false)}>
            {inner}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <button onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
          <img src={LOGO_URL} alt="Midnight Graphics" className="h-9 w-9 rounded-full" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Midnight Graphics</p>
            <p className="text-xs opacity-70">Admin</p>
          </div>
        </div>
        {nav}
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <p className="ml-auto truncate text-sm text-muted-foreground">{user.email}</p>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
