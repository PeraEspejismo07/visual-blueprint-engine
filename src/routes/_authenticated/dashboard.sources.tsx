import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addMockConnection, createPairingCode, getOverview, removeConnection } from "@/lib/dashboard.functions";
import { toast } from "sonner";
import { Check, Copy, Download, Puzzle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/sources")({
  component: Sources,
});

const PROVIDERS = [
  { id: "google_drive", name: "Google Drive" },
  { id: "gmail", name: "Gmail adjuntos" },
  { id: "onedrive", name: "OneDrive" },
  { id: "dropbox", name: "Dropbox" },
  { id: "icloud", name: "iCloud Drive" },
  { id: "local", name: "Descargas locales" },
];

function Sources() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });
  const [pairing, setPairing] = useState<{ code: string; expiresAt: string } | null>(null);

  const genCode = useMutation({
    mutationFn: () => createPairingCode(),
    onSuccess: (d) => {
      setPairing(d);
      toast.success("Código generado. Válido 10 minutos.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addConn = useMutation({
    mutationFn: (provider: string) => addMockConnection({ data: { provider } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success("Fuente añadida. Autoriza el acceso en la extensión.");
    },
  });

  const rmConn = useMutation({
    mutationFn: (id: string) => removeConnection({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["overview"] }),
  });

  const connections = data?.connections ?? [];
  const devices = data?.devices ?? [];

  const downloadExt = () => {
    fetch("/carbofile-extension.zip")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo descargar. Empaqueta la extensión primero.");
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "carbofile-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => toast.error(e.message));
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-8 space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Extensión</p>
        <h1 className="mt-2 text-3xl font-light tracking-tight">Fuentes y dispositivos</h1>
      </div>

      {/* Extension pairing */}
      <div className="rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Puzzle className="h-5 w-5 text-moss" />
          </div>
          <div className="flex-1">
            <p className="text-sm">Extensión del navegador</p>
            <p className="text-xs text-muted-foreground mt-1">
              Instala Carbofile en tu navegador. Vincúlala con un código de 6 dígitos y el agente
              actuará sobre cada descarga y cada archivo que sincronices.
            </p>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 1 · Instalar</p>
                <button
                  onClick={downloadExt}
                  className="mt-3 flex items-center gap-2 rounded-full bg-foreground text-background text-sm px-4 py-2 hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar (.zip)
                </button>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Descomprime, abre chrome://extensions, activa Modo desarrollador, "Cargar sin
                  empaquetar" y selecciona la carpeta.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 2 · Vincular</p>
                {pairing ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-light tracking-[0.4em] tabular-nums">{pairing.code}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pairing.code);
                          toast.success("Código copiado");
                        }}
                        className="p-2 rounded-md hover:bg-foreground/10"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Válido hasta {new Date(pairing.expiresAt).toLocaleTimeString("es")}. Pégalo en
                      la extensión.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => genCode.mutate()}
                    disabled={genCode.isPending}
                    className="mt-3 rounded-full border border-border text-sm px-4 py-2 hover:border-foreground disabled:opacity-50"
                  >
                    {genCode.isPending ? "Generando…" : "Generar código"}
                  </button>
                )}
              </div>
            </div>

            {devices.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Dispositivos vinculados</p>
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm rounded-lg border border-border px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-moss" />
                      <span>{d.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Última vez: {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString("es") : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Providers */}
      <div className="rounded-xl border border-border">
        <div className="px-5 h-12 border-b border-border flex items-center">
          <p className="text-sm">Servicios conectados</p>
        </div>
        <ul className="divide-y divide-border">
          {PROVIDERS.map((p) => {
            const conn = connections.find((c) => c.provider === p.id);
            return (
              <li key={p.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {conn ? (conn.status === "pending" ? "Pendiente de autorización en la extensión" : "Conectado") : "No conectado"}
                  </p>
                </div>
                {conn ? (
                  <button
                    onClick={() => rmConn.mutate(conn.id)}
                    className="p-2 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => addConn.mutate(p.id)}
                    className="text-sm rounded-full border border-border px-4 py-1.5 hover:border-foreground"
                  >
                    Conectar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
