import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Carbofile — Acceder" },
      { name: "description", content: "Inicia sesión o crea tu cuenta de Carbofile." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/dashboard" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setMsg(result.error.message);
    setLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        setMsg("Cuenta creada. Revisa tu correo para confirmar el acceso.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setMsg("Te hemos enviado un enlace para restablecer la contraseña.");
      }
    } catch (err) {
      setMsg((err as Error)?.message ?? "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-16">
        <Link to="/" className="mb-10 flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-moss" />
          <span className="tracking-tight">Carbofile</span>
        </Link>
        <h1 className="text-3xl font-light tracking-tight">
          {mode === "login" ? "Bienvenido de nuevo" : mode === "register" ? "Crea tu cuenta" : "Recupera tu contraseña"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Accede a tu panel de Carbofile."
            : mode === "register"
              ? "Empieza a recuperar espacio y a reducir tu huella digital."
              : "Te enviaremos un enlace por correo."}
        </p>

        {mode !== "reset" && (
          <>
            <button
              onClick={google}
              disabled={loading}
              className="mt-8 w-full rounded-full border border-border px-6 py-3 text-sm hover:border-foreground transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.5-1.68 4.4-5.5 4.4-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.9 0 3.16.8 3.9 1.5l2.66-2.56C16.9 3.7 14.7 2.8 12 2.8 6.8 2.8 2.5 7 2.5 12.4s4.3 9.6 9.5 9.6c5.5 0 9.14-3.86 9.14-9.3 0-.62-.06-1.1-.16-1.5H12z"/></svg>
              Continuar con Google
            </button>
            <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> o con correo <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          {mode !== "reset" && (
            <div>
              <label className="text-xs text-muted-foreground">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </div>
          )}

          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : mode === "register" ? "Registrarme" : "Enviar enlace"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-xs text-muted-foreground">
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="hover:text-foreground">
            {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
          </button>
          <button onClick={() => setMode("reset")} className="hover:text-foreground">
            Olvidé mi contraseña
          </button>
        </div>
      </div>
    </main>
  );
}
