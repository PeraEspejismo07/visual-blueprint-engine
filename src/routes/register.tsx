import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta — CarboFile" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.trim().length > 1 && validEmail && password.length >= 8 && accepted && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("¡Cuenta creada!");
    navigate({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error("No pudimos continuar con Google");
    if (!result.redirected) navigate({ to: "/dashboard" });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          CarboFile
        </Link>
        <h1 className="text-center text-2xl font-semibold">Crea tu cuenta gratis</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Empieza a medir tu impacto en minutos</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Nombre completo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary"
              placeholder="Ada Lovelace"
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary"
              placeholder="tu@correo.com"
              required
            />
          </Field>
          <Field label="Contraseña">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary"
              placeholder="Mínimo 8 caracteres"
              required
            />
          </Field>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--primary)]"
            />
            <span>Acepto los términos y condiciones</span>
          </label>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta…" : "Registrarte"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={onGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-neutral-900 transition hover:brightness-95"
        >
          Continuar con Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:brightness-110">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
