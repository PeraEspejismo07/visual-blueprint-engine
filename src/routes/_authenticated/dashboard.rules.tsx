import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOverview, updateRules } from "@/lib/dashboard.functions";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/rules")({
  component: Rules,
});

const LEVELS = [
  { id: "conservative", label: "Conservador", desc: "Solo elimina duplicados exactos y sugiere el resto." },
  { id: "balanced", label: "Equilibrado", desc: "Elimina duplicados e instaladores viejos, sugiere lo demás." },
  { id: "aggressive", label: "Agresivo", desc: "El agente decide y borra todo lo redundante automáticamente." },
] as const;

function Rules() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });
  const r = data?.rules;
  const [state, setState] = useState({
    aggressiveness: "balanced" as "conservative" | "balanced" | "aggressive",
    min_size_mb: 1,
    undo_window_days: 30 as 7 | 30 | 90,
    auto_delete: true,
    notifications_enabled: true,
  });

  useEffect(() => {
    if (r) {
      setState({
        aggressiveness: (r.aggressiveness ?? "balanced") as typeof state.aggressiveness,
        min_size_mb: Number(r.min_size_mb ?? 1),
        undo_window_days: (r.undo_window_days ?? 30) as 7 | 30 | 90,
        auto_delete: !!r.auto_delete,
        notifications_enabled: !!r.notifications_enabled,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r?.id]);

  const save = useMutation({
    mutationFn: () => updateRules({ data: state }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success("Reglas actualizadas");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[900px] px-6 md:px-10 py-8 space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Comportamiento</p>
        <h1 className="mt-2 text-3xl font-light tracking-tight">Reglas del agente</h1>
      </div>

      <section className="rounded-xl border border-border p-6">
        <p className="text-sm">Nivel de agresividad</p>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {LEVELS.map((l) => {
            const active = state.aggressiveness === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setState((s) => ({ ...s, aggressiveness: l.id }))}
                className={
                  "text-left rounded-lg border p-4 transition-colors " +
                  (active ? "border-moss bg-moss/5" : "border-border hover:border-foreground/30")
                }
              >
                <p className="text-sm">{l.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{l.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border p-6 space-y-6">
        <Row label="Auto-eliminación" desc="Deja que el agente borre archivos sin pedir confirmación.">
          <Toggle value={state.auto_delete} onChange={(v) => setState((s) => ({ ...s, auto_delete: v }))} />
        </Row>
        <Row label="Notificaciones" desc="Aviso cuando el agente elimina más de 500 MB de una vez.">
          <Toggle value={state.notifications_enabled} onChange={(v) => setState((s) => ({ ...s, notifications_enabled: v }))} />
        </Row>
        <Row label="Tamaño mínimo (MB)" desc="Ignora archivos por debajo de este umbral.">
          <input
            type="number"
            min={0}
            value={state.min_size_mb}
            onChange={(e) => setState((s) => ({ ...s, min_size_mb: Number(e.target.value) }))}
            className="w-24 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm text-right tabular-nums focus:border-foreground outline-none"
          />
        </Row>
        <Row label="Ventana de reversión" desc="Días durante los que puedes recuperar un archivo.">
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setState((s) => ({ ...s, undo_window_days: d as 7 | 30 | 90 }))}
                className={
                  "px-3 py-1.5 text-sm rounded-md tabular-nums " +
                  (state.undo_window_days === d ? "bg-foreground text-background" : "border border-border")
                }
              >
                {d} d
              </button>
            ))}
          </div>
        </Row>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {save.isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-sm">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={"relative h-6 w-11 rounded-full transition " + (value ? "bg-moss" : "bg-border")}
    >
      <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-background transition " + (value ? "left-5" : "left-0.5")} />
    </button>
  );
}
