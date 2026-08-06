import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Copy, Download, Puzzle, Sparkles } from "lucide-react";
import { addMockConnection, createPairingCode, updateRules } from "@/lib/dashboard.functions";

const PROVIDERS = [
  { id: "google_drive", name: "Google Drive" },
  { id: "gmail", name: "Gmail adjuntos" },
  { id: "onedrive", name: "OneDrive" },
  { id: "dropbox", name: "Dropbox" },
  { id: "local", name: "Descargas locales" },
];

const LEVELS = [
  { id: "conservative", name: "Conservador", desc: "Solo sugiere. Nada se borra sin tu visto bueno." },
  { id: "balanced", name: "Equilibrado", desc: "Elimina duplicados evidentes, el resto lo consulta." },
  { id: "aggressive", name: "Agresivo", desc: "Actúa solo. Todo reversible durante 30 días." },
] as const;

export function Onboarding({ open, onDone }: { open: boolean; onDone: () => void }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["id"]>("balanced");

  const genCode = useMutation({
    mutationFn: () => createPairingCode(),
    onSuccess: (d) => setCode(d.code),
    onError: (e: Error) => toast.error(e.message),
  });

  const finish = useMutation({
    mutationFn: async () => {
      if (provider) await addMockConnection({ data: { provider } });
      await updateRules({ data: { aggressiveness: level } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success("Agente configurado. Ya puedes empezar.");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const download = () => {
    fetch("/carbofile-extension.zip")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo descargar la extensión.");
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
    <Dialog open={open} onOpenChange={(v) => !v && onDone()}>
      <DialogContent className="max-w-xl border-border bg-background p-0 overflow-hidden">
        <div className="flex gap-1 px-6 pt-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors ${i <= step ? "bg-moss" : "bg-foreground/10"}`}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-5 space-y-5">
          {step === 0 && (
            <div className="space-y-4">
              <Puzzle className="h-5 w-5 text-moss" />
              <div>
                <h2 className="text-2xl font-light tracking-tight">Instala la extensión</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  El agente corre en tu navegador. Tus archivos nunca salen de tu equipo: solo se sincronizan las
                  métricas.
                </p>
              </div>
              <Button variant="secondary" onClick={download} className="gap-2">
                <Download className="h-4 w-4" /> Descargar extensión
              </Button>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Descomprime el archivo.</li>
                <li>
                  Abre <code className="text-foreground">chrome://extensions</code> y activa el modo desarrollador.
                </li>
                <li>Pulsa «Cargar descomprimida» y elige la carpeta.</li>
              </ol>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm">Vincula tu cuenta con un código de 6 dígitos.</p>
                {code ? (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-3xl font-light tabular-nums tracking-[0.3em]">{code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        toast.success("Copiado");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="mt-3" onClick={() => genCode.mutate()} disabled={genCode.isPending}>
                    Generar código
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Sparkles className="h-5 w-5 text-moss" />
              <div>
                <h2 className="text-2xl font-light tracking-tight">Conecta tu primera fuente</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Puedes añadir más después desde Fuentes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      provider === p.id ? "border-moss bg-moss/10" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {p.name}
                      {provider === p.id && <Check className="h-4 w-4 text-moss" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Sparkles className="h-5 w-5 text-moss" />
              <div>
                <h2 className="text-2xl font-light tracking-tight">Nivel del agente</h2>
                <p className="mt-2 text-sm text-muted-foreground">Puedes cambiarlo cuando quieras en Reglas.</p>
              </div>
              <div className="space-y-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      level === l.id ? "border-moss bg-moss/10" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="text-sm">{l.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={onDone}>
              Saltar por ahora
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Atrás
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)}>Continuar</Button>
              ) : (
                <Button onClick={() => finish.mutate()} disabled={finish.isPending}>
                  {finish.isPending ? "Guardando…" : "Empezar"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
