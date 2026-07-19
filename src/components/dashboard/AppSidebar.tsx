import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Activity, Plug, Sliders, Trash2, Settings, LogOut, Puzzle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const items = [
  { to: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { to: "/dashboard/activity", label: "Actividad", icon: Activity },
  { to: "/dashboard/sources", label: "Fuentes", icon: Plug },
  { to: "/dashboard/rules", label: "Reglas del agente", icon: Sliders },
  { to: "/dashboard/trash", label: "Papelera", icon: Trash2 },
  { to: "/dashboard/settings", label: "Ajustes", icon: Settings },
] as const;

export function AppSidebar({ email }: { email: string | null }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-border bg-background/60 backdrop-blur">
      <Link to="/dashboard" className="flex items-center gap-2 px-5 h-14 border-b border-border">
        <span className="h-2 w-2 rounded-full bg-moss" />
        <span className="tracking-tight text-sm">Carbofile</span>
      </Link>

      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors " +
                (active
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5")
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-3">
        <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-foreground/5 text-[12px]">
          <Puzzle className="h-3.5 w-3.5 text-moss" />
          <span className="text-muted-foreground">Extensión</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" /> activa
          </span>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Cuenta</p>
            <p className="text-[12px] truncate">{email ?? "—"}</p>
          </div>
          <button
            onClick={signOut}
            title="Cerrar sesión"
            className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
