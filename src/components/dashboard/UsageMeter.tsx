import { Link } from "@tanstack/react-router";
import { Infinity as InfinityIcon, Sparkles } from "lucide-react";

const MB = 1_000_000;

export type Usage = {
  plan: "free" | "pro";
  usedBytes: number;
  limitBytes: number;
  blocked: boolean;
};

export function UsageMeter({ usage }: { usage: Usage }) {
  if (usage.plan === "pro") {
    return (
      <div className="rounded-xl border border-border p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Límite de limpieza</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <InfinityIcon className="h-4 w-4 text-moss" />
          <span>Limpieza ilimitada</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Plan Pro · S/19.90/mes</p>
      </div>
    );
  }

  const usedMb = usage.usedBytes / MB;
  const limitMb = usage.limitBytes / MB;
  const pct = Math.min(100, limitMb > 0 ? (usedMb / limitMb) * 100 : 0);

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Límite mensual · Free</p>
        <span className="text-[11px] text-muted-foreground tabular-nums">{pct.toFixed(0)}%</span>
      </div>
      <p className="mt-3 text-sm tabular-nums">
        {usedMb.toFixed(0)} MB / {limitMb.toFixed(0)} MB utilizados
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={"h-full rounded-full transition-all " + (usage.blocked ? "bg-foreground" : "bg-moss")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        El contador se reinicia automáticamente al comenzar cada mes.
      </p>
      {usage.blocked && (
        <Link
          to="/dashboard/settings"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs text-background hover:opacity-90"
        >
          <Sparkles className="h-3.5 w-3.5" /> Actualizar a Pro
        </Link>
      )}
    </div>
  );
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7">
        <p className="text-[11px] uppercase tracking-widest text-moss">Límite alcanzado</p>
        <h2 className="display mt-3 text-3xl leading-tight">Has alcanzado tu límite gratuito</h2>
        <p className="mt-4 text-sm text-muted-foreground">Has limpiado 500 MB este mes.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza a Carbofile Pro para continuar limpiando sin límites.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Seguirás pudiendo analizar tus archivos, recibir sugerencias y consultar tu panel.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90"
          >
            Actualizar a Pro — S/19.90/mes
          </button>
          <a
            href="/#precios"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm transition hover:border-foreground"
          >
            Ver planes
          </a>
        </div>
      </div>
    </div>
  );
}
