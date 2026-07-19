import { useRouterState } from "@tanstack/react-router";
import { Flame, Search } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/activity": "Actividad",
  "/dashboard/sources": "Fuentes",
  "/dashboard/rules": "Reglas del agente",
  "/dashboard/trash": "Papelera",
  "/dashboard/settings": "Ajustes",
};

export function Topbar({ streak, onCmd }: { streak: number; onCmd: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "Panel";

  return (
    <header className="h-14 shrink-0 border-b border-border flex items-center px-6 gap-4">
      <p className="text-sm tracking-tight">{title}</p>
      <button
        onClick={onCmd}
        className="ml-auto flex items-center gap-2 h-8 px-3 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar o ejecutar</span>
        <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-foreground/10">⌘K</kbd>
      </button>
      <div className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-foreground/5 text-[12px]" title="Racha">
        <Flame className="h-3.5 w-3.5 text-moss" />
        <span className="tabular-nums">{streak}</span>
        <span className="text-muted-foreground">días</span>
      </div>
    </header>
  );
}
