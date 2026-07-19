import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Activity, LayoutDashboard, Plug, Puzzle, Settings, Sliders, Trash2 } from "lucide-react";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Ir a, o ejecutar una acción…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Navegar">
          <CommandItem onSelect={() => go("/dashboard")}><LayoutDashboard className="mr-2 h-4 w-4" />Resumen</CommandItem>
          <CommandItem onSelect={() => go("/dashboard/activity")}><Activity className="mr-2 h-4 w-4" />Actividad</CommandItem>
          <CommandItem onSelect={() => go("/dashboard/sources")}><Plug className="mr-2 h-4 w-4" />Fuentes</CommandItem>
          <CommandItem onSelect={() => go("/dashboard/rules")}><Sliders className="mr-2 h-4 w-4" />Reglas del agente</CommandItem>
          <CommandItem onSelect={() => go("/dashboard/trash")}><Trash2 className="mr-2 h-4 w-4" />Papelera</CommandItem>
          <CommandItem onSelect={() => go("/dashboard/settings")}><Settings className="mr-2 h-4 w-4" />Ajustes</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => go("/dashboard/sources")}><Puzzle className="mr-2 h-4 w-4" />Vincular extensión</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
