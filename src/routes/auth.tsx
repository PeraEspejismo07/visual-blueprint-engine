import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        setMsg("Cuenta creada. Revisa tu correo para confirmar el acceso.");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Ha ocurrido un error");
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
          {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Accede a tu panel de Carbofile."
            : "Empieza a recuperar espacio y reducir tu huella digital."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
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

          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Registrarme"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-6 text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </main>
  );
}
