import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Home, LineChart, Plug, Settings, LogOut, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardLayout,
});

const NAV: Array<{ to: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { to: "/dashboard", label: "Inicio", icon: Home, exact: true },
  { to: "/dashboard/impacto", label: "Mi impacto", icon: LineChart },
  { to: "/dashboard/conexiones", label: "Conexiones", icon: Plug },
  { to: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/login" });
      else setUser(data.user);
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!checked) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Cargando…</div>;
  if (!user) return null;

  const displayName = (user.user_metadata as { full_name?: string })?.full_name || user.email?.split("@")[0] || "amigo";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-3.5 w-3.5" />
          </span>
          CarboFile
        </Link>
        <button onClick={() => setOpen((o) => !o)} className="rounded-md p-2 hover:bg-surface">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-surface p-4 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" className="mb-8 mt-2 hidden items-center gap-2 font-semibold md:flex">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          CarboFile
        </Link>
        <nav className="mt-14 flex-1 space-y-1 md:mt-0">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={signOut} title="Cerrar sesión" className="rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 pb-10 pt-20 md:px-10 md:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
