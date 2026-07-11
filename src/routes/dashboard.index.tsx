import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HardDrive, Leaf, Flame, Puzzle, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

type DailyMetric = { date: string; gb_freed: number; co2_kg_saved: number };
type Action = { id: string; source: string; action_type: string; file_name: string | null; size_bytes: number; co2_grams_saved: number; created_at: string };
type Profile = { full_name: string | null; streak_days: number };

function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [extConnected, setExtConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: m }, { data: a }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("full_name, streak_days").eq("id", user.id).maybeSingle(),
        supabase.from("daily_metrics").select("date, gb_freed, co2_kg_saved").eq("user_id", user.id).order("date", { ascending: true }).limit(30),
        supabase.from("cleanup_actions").select("id, source, action_type, file_name, size_bytes, co2_grams_saved, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
        supabase.from("connections").select("id, extension_device_id").eq("user_id", user.id).eq("provider", "browser_extension").maybeSingle(),
      ]);
      setProfile(p as Profile | null);
      setMetrics((m || []) as DailyMetric[]);
      setActions((a || []) as Action[]);
      setExtConnected(!!c?.extension_device_id);
    })();
  }, []);

  const totals = useMemo(() => {
    const gb = metrics.reduce((s, x) => s + Number(x.gb_freed || 0), 0);
    const co2 = metrics.reduce((s, x) => s + Number(x.co2_kg_saved || 0), 0);
    return { gb, co2 };
  }, [metrics]);

  const chartData = useMemo(() => {
    return metrics.map((m) => ({
      date: new Date(m.date).toLocaleDateString("es", { day: "2-digit", month: "short" }),
      co2: Number(m.co2_kg_saved || 0),
    }));
  }, [metrics]);

  const displayName = profile?.full_name || "amigo";
  const today = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });

  const cards = [
    { icon: HardDrive, label: "GB liberados", value: totals.gb.toFixed(2), sub: "acumulado" },
    { icon: Leaf, label: "CO₂ evitado", value: `${totals.co2.toFixed(2)} kg`, sub: `≈ ${Math.round(totals.co2 * 0.5)} árboles por un día` },
    { icon: Flame, label: "Racha activa", value: `${profile?.streak_days ?? 0} días`, sub: "consecutivos" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">Hola, {displayName} 👋</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
      </header>

      {!extConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 md:flex-row md:items-center"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
              <Puzzle className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold">Instala la extensión</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Conecta tu navegador para empezar a medir tu impacto.
              </p>
            </div>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110">
            Instalar extensión
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <c.icon className="h-4 w-4 text-primary" /> {c.label}
            </div>
            <div className="mt-3 text-3xl font-semibold">{c.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">CO₂ evitado — últimos 30 días</h2>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="h-64">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Aún no hay datos. Instala la extensión para empezar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a938c" fontSize={11} />
                <YAxis stroke="#8a938c" fontSize={11} />
                <Tooltip contentStyle={{ background: "#12161a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="co2" stroke="#00e676" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold">Actividad reciente</h2>
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
        ) : (
          <ul className="space-y-3">
            {actions.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">
                    {actionLabel(a)}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("es")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function actionLabel(a: Action) {
  const mb = (a.size_bytes / 1024 / 1024).toFixed(1);
  if (a.action_type === "tab_closed") return `Cerraste una pestaña duplicada`;
  if (a.source === "drive") return `Liberaste ${mb} MB en Drive`;
  if (a.source === "gmail") return `Archivaste correos por ${mb} MB`;
  if (a.source === "downloads") return `Eliminaste descargas por ${mb} MB`;
  return a.file_name || "Acción registrada";
}
