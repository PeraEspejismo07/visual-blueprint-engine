import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Puzzle, Cloud, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/dashboard/conexiones")({
  component: ConexionesPage,
});

type Conn = { id: string; provider: string; extension_device_id: string | null; status: string; connected_at: string };

function ConexionesPage() {
  const [conns, setConns] = useState<Conn[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("connections").select("id, provider, extension_device_id, status, connected_at").eq("user_id", user.id);
    setConns((data || []) as Conn[]);
  };

  useEffect(() => { load(); }, []);

  const drive = conns.find((c) => c.provider === "google_drive");
  const ext = conns.find((c) => c.provider === "browser_extension" && c.extension_device_id);

  const connectDrive = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard/conexiones",
      extraParams: { scope: "https://www.googleapis.com/auth/drive.readonly openid email profile", prompt: "consent" },
    });
    if (result.error) toast.error("No pudimos conectar Google Drive");
  };

  const disconnect = async (id: string) => {
    await supabase.from("connections").delete().eq("id", id);
    toast.success("Desconectado");
    load();
  };

  const generateCode = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.functions.invoke("link-extension", {
      body: { action: "generate", user_id: user.id },
    });
    setLoading(false);
    if (error) return toast.error("No se pudo generar el código");
    setCode((data as { pairing_code: string }).pairing_code);
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">Conexiones</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vincula Google Drive y la extensión de navegador.</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Cloud className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold">Google Drive / Gmail</p>
              <p className="text-xs text-muted-foreground">
                {drive ? "Conectado — leemos solo metadata." : "Analiza archivos redundantes y correos pesados."}
              </p>
            </div>
          </div>
          {drive ? (
            <button onClick={() => disconnect(drive.id)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-red-400 hover:text-red-400">
              Desconectar
            </button>
          ) : (
            <button onClick={connectDrive} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110">
              Conectar
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Puzzle className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold">Extensión de navegador</p>
              <p className="text-xs text-muted-foreground">
                {ext ? "Vinculada correctamente" : "Genera un código y pégalo en el popup de la extensión."}
              </p>
            </div>
          </div>
          {ext ? (
            <button onClick={() => disconnect(ext.id)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-red-400 hover:text-red-400">
              Desvincular
            </button>
          ) : (
            <button
              onClick={generateCode}
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Generando…" : "Generar código"}
            </button>
          )}
        </div>
        {code && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-background p-4">
            <div>
              <p className="text-xs text-muted-foreground">Código de emparejamiento (válido 10 min)</p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-widest text-primary">{code}</p>
            </div>
            <button onClick={copyCode} className="rounded-lg border border-border px-3 py-2 text-xs">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
