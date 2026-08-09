import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRecentActions } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard/activity")({
  component: Activity,
});

function Activity() {
  const { data } = useQuery({ queryKey: ["actions"], queryFn: () => listRecentActions() });
  const list = data ?? [];
  return (
    <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-8">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Historial</p>
      <h1 className="mt-2 text-3xl font-light tracking-tight">Actividad del agente</h1>
      <div className="mt-6 rounded-xl border border-border overflow-hidden">
        {list.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Sin actividad todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.03] text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Archivo</th>
                <th className="text-left px-5 py-3 font-normal">Fuente</th>
                <th className="text-right px-5 py-3 font-normal">Tamaño</th>
                <th className="text-left px-5 py-3 font-normal">Acción</th>
                <th className="text-right px-5 py-3 font-normal">Cuándo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 truncate max-w-[300px]">{a.file_name ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.source}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{((a.size_bytes ?? 0) / 1_000_000).toFixed(1)} MB</td>
                  <td className="px-5 py-3"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.action_type}</span></td>
                  <td className="px-5 py-3 text-right text-muted-foreground text-[12px]">{new Date(a.created_at ?? "").toLocaleString("es")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
