import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOverview, listRecentActions, getUsage } from "@/lib/dashboard.functions";
import { UsageMeter, UpgradeModal } from "@/components/dashboard/UsageMeter";
import { Onboarding } from "@/components/dashboard/Onboarding";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, HardDrive, Leaf, Zap } from "lucide-react";


export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function fmtGb(n: number) {
  return n < 1 ? `${(n * 1000).toFixed(0)} MB` : `${n.toFixed(2)} GB`;
}

function Overview() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const overview = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });
  const actions = useQuery({ queryKey: ["actions"], queryFn: () => listRecentActions(), refetchInterval: 15_000 });
  const usage = useQuery({ queryKey: ["usage"], queryFn: () => getUsage(), refetchInterval: 30_000 });

  const [upgradeDismissed, setUpgradeDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel("cleanup:" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cleanup_actions", filter: `user_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["actions"] });
          qc.invalidateQueries({ queryKey: ["overview"] });
          qc.invalidateQueries({ queryKey: ["usage"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, qc]);

  const t = overview.data?.totals ?? { gb: 0, co2: 0, actions: 0 };
  const series = overview.data?.series ?? [];
  const streak = overview.data?.profile?.streak_days ?? 0;
  const devices = overview.data?.devices ?? [];
  const rules = overview.data?.rules;

  const kmEquivalent = useMemo(() => (t.co2 * 6).toFixed(1), [t.co2]);

  // First-run wizard: shown once until the user configures the agent or skips.
  const [skipped, setSkipped] = useState(false);
  useEffect(() => {
    setSkipped(localStorage.getItem("carbofile:onboarded") === "1");
  }, []);
  const showOnboarding =
    !skipped && overview.isSuccess && devices.length === 0 && !rules && (overview.data?.connections.length ?? 0) === 0;
  const dismiss = () => {
    localStorage.setItem("carbofile:onboarded", "1");
    setSkipped(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-8 space-y-8">
      <Onboarding open={showOnboarding} onDone={dismiss} />
      <UpgradeModal
        open={!showOnboarding && !upgradeDismissed && !!usage.data?.blocked}
        onClose={() => setUpgradeDismissed(true)}
      />

      {/* Extension not paired banner */}
      {devices.length === 0 && (
        <div className="rounded-xl border border-moss/40 bg-moss/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm">Aún no has vinculado la extensión.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Instálala y empareja tu navegador para que el agente empiece a trabajar.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/dashboard/sources" })}
            className="rounded-full bg-foreground text-background text-sm px-4 py-2 hover:opacity-90"
          >
            Vincular ahora
          </button>
        </div>
      )}

      {/* Hero metric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border p-6">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Espacio liberado · últimos 30 días</p>
          <div className="mt-2 flex items-end gap-4">
            <p className="display text-6xl tabular-nums">{fmtGb(t.gb)}</p>
            <p className="text-xs text-moss mb-2 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> agente activo
            </p>
          </div>
          <div className="mt-6 h-40">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6f7f4a" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6f7f4a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b8b84" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#212b23", border: "1px solid rgba(234,230,223,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#8b8b84" }}
                  formatter={(v: number) => [`${v.toFixed(2)} GB`, "Liberado"]}
                />
                <Area type="monotone" dataKey="gb" stroke="#6f7f4a" fill="url(#g)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <KPI icon={HardDrive} label="Archivos gestionados" value={t.actions.toLocaleString("es")} />
          <KPI icon={Leaf} label="CO₂ evitado" value={`${t.co2.toFixed(2)} kg`} />
          <KPI icon={Zap} label="Fuentes activas" value={String((overview.data?.connections ?? []).length)} />
          <KPI icon={Leaf} label="Racha" value={`${streak} d`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live feed */}
        <div className="lg:col-span-2 rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 h-12 border-b border-border">
            <p className="text-sm">Actividad en vivo</p>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" /> tiempo real
            </span>
          </div>
          {(actions.data ?? []).length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm">El agente está en reposo.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Cuando descargues archivos o sincronices tu nube, aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[420px] overflow-auto">
              {(actions.data ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{a.file_name ?? "Archivo sin nombre"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {a.source} · {((a.size_bytes ?? 0) / 1_000_000).toFixed(1)} MB ·{" "}
                      {new Date(a.created_at ?? "").toLocaleTimeString("es")}
                    </p>
                  </div>
                  <ActionTag t={a.action_type} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Impact + agent status */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Impacto ambiental</p>
            <p className="mt-3 text-lg font-light leading-snug">
              Has evitado el equivalente a <span className="text-moss">{kmEquivalent} km</span> en coche.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Cada GB almacenado en la nube emite ~4,4 kg de CO₂ al año.
            </p>
          </div>

          {usage.data && <UsageMeter usage={usage.data} />}

          <div className="rounded-xl border border-border p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Estado del agente</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-moss" />
              <span>{rules?.auto_delete ? "Auto-eliminación activa" : "Modo revisión"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground capitalize">
              Nivel: {rules?.aggressiveness ?? "equilibrado"} · Reversión {rules?.undo_window_days ?? 30} días
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[11px] uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-3 text-2xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function ActionTag({ t }: { t: string }) {
  const styles: Record<string, string> = {
    eliminado: "bg-foreground text-background",
    archivado: "border border-border",
    sugerido: "border border-dashed border-border text-muted-foreground",
    restaurado: "border border-moss/40 text-moss",
  };
  return <span className={"ml-4 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider " + (styles[t] ?? "border border-border")}>{t}</span>;
}
