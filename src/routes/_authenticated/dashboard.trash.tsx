import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listTrash, restoreAction } from "@/lib/dashboard.functions";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/trash")({
  component: Trash,
});

function Trash() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["trash"], queryFn: () => listTrash() });
  const restore = useMutation({
    mutationFn: (id: string) => restoreAction({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash"] });
      qc.invalidateQueries({ queryKey: ["actions"] });
      toast.success("Solicitud enviada a la extensión");
    },
  });
  const list = data ?? [];

  return (
    <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-8">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Recuperación</p>
      <h1 className="mt-2 text-3xl font-light tracking-tight">Papelera reversible</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Archivos que el agente ha borrado y aún puedes restaurar.
      </p>

      <div className="mt-6 rounded-xl border border-border overflow-hidden">
        {list.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">La papelera está vacía.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{a.file_name ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {a.source} · {((a.size_bytes ?? 0) / 1_000_000).toFixed(1)} MB ·{" "}
                    {new Date(a.created_at ?? "").toLocaleString("es")}
                  </p>
                </div>
                <button
                  onClick={() => restore.mutate(a.id)}
                  className="flex items-center gap-1.5 text-[12px] rounded-full border border-border px-3 py-1.5 hover:border-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
