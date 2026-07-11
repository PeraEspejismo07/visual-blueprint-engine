import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/impacto")({
  component: ImpactoPage,
});

type Metric = { date: string; gb_freed: number; co2_kg_saved: number; actions_count: number };

function ImpactoPage() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [rows, setRows] = useState<Metric[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(Date.now() - range * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("daily_metrics")
        .select("date, gb_freed, co2_kg_saved, actions_count")
        .eq("user_id", user.id)
        .gte("date", since)
        .order("date", { ascending: true });
      setRows((data || []) as Metric[]);
    })();
  }, [range]);

  const totals = useMemo(() => {
    const gb = rows.reduce((s, x) => s + Number(x.gb_freed || 0), 0);
    const co2 = rows.reduce((s, x) => s + Number(x.co2_kg_saved || 0), 0);
    const actions = rows.reduce((s, x) => s + Number(x.actions_count || 0), 0);
    return { gb, co2, actions };
  }, [rows]);

  const chartData = rows.map((r) => ({
    date: new Date(r.date).toLocaleDateString("es", { day: "2-digit", month: "short" }),
    co2: Number(r.co2_kg_saved || 0),
  }));

  // Simulated social comparison
  const percentile = Math.min(95, 40 + Math.round(totals.co2 * 5));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Mi impacto</h1>
          <p className="mt-1 text-sm text-muted-foreground">Historial completo y comparativa social.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as 7 | 30 | 90)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                range === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {r} días
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total GB liberados" value={totals.gb.toFixed(2)} />
        <Stat label="Total CO₂ evitado" value={`${totals.co2.toFixed(2)} kg`} />
        <Stat label="Acciones" value={String(totals.actions)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold">CO₂ evitado por día</h2>
        <div className="h-72">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">Sin datos en el rango.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a938c" fontSize={11} />
                <YAxis stroke="#8a938c" fontSize={11} />
                <Tooltip contentStyle={{ background: "#12161a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="co2" fill="#00e676" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Comparación social</h2>
        <p className="mt-2 text-sm text-muted-foreground">Estás mejor que el <span className="font-semibold text-primary">{percentile}%</span> de usuarios este mes.</p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentile}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
