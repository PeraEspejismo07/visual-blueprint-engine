import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Carbofile — Nueva contraseña" }] }),
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) setMsg(error.message);
    else navigate({ to: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[380px] space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Elige una nueva contraseña</h1>
          <p className="mt-2 text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
        </div>
        <input
          type="password"
          required
          minLength={6}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground outline-none"
        />
        {msg && <p className="text-xs text-destructive">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-foreground text-background text-sm px-6 py-3 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}
