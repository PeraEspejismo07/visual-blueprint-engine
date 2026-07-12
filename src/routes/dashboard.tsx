import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Carbofile — Panel" },
      { name: "description", content: "Tu agente de IA está limpiando archivos innecesarios en segundo plano." },
    ],
  }),
});

type EventItem = {
  id: string;
  source: string;
  file: string;
  size: string;
  action: "eliminado" | "archivado" | "sugerido";
  when: string;
};

const seedEvents: EventItem[] = [
  { id: "1", source: "Descargas", file: "informe-q3-final-v7.pdf", size: "4.2 MB", action: "eliminado", when: "hace 2 min" },
  { id: "2", source: "Google Drive", file: "captura-2024-08-11.png", size: "1.1 MB", action: "sugerido", when: "hace 6 min" },
  { id: "3", source: "OneDrive", file: "backup-antiguo.zip", size: "812 MB", action: "archivado", when: "hace 14 min" },
  { id: "4", source: "Descargas", file: "installer-duplicate(3).dmg", size: "128 MB", action: "eliminado", when: "hace 22 min" },
  { id: "5", source: "Gmail adjuntos", file: "newsletter-imagen.jpg", size: "320 KB", action: "eliminado", when: "hace 40 min" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<EventItem[]>(seedEvents);
  const [autoDelete, setAutoDelete] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth" });
      else setEmail(session.user.email ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/auth" });
      else {
        setEmail(data.user.email ?? null);
        setReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const stats = useMemo(
    () => ({
      liberado: "2,84 GB",
      archivos: 1247,
      co2: "12,6 kg",
      fuentes: 5,
    }),
    [],
  );

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando panel…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-moss" />
            <span className="tracking-tight">Carbofile</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
            <span className="hidden md:inline">{email}</span>
            <button
              onClick={signOut}
              className="rounded-full border border-border px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Panel · Agente</p>
        <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">
          Tu agente está trabajando, {email?.split("@")[0] ?? "hola"}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          La extensión de Carbofile analiza cada archivo que descargas o que se sincroniza en tus
          servicios conectados (Google Drive, OneDrive, Dropbox, iCloud) y decide, con IA, si vale la
          pena guardarlo.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Espacio liberado", stats.liberado],
            ["Archivos gestionados", stats.archivos.toString()],
            ["CO₂ evitado", stats.co2],
            ["Fuentes conectadas", stats.fuentes.toString()],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border p-5">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</p>
              <p className="mt-3 text-2xl tracking-tight">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm">Actividad reciente del agente</p>
              <span className="text-[11px] text-muted-foreground">en vivo</span>
            </div>
            <ul className="divide-y divide-border">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{e.file}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.source} · {e.size} · {e.when}
                    </p>
                  </div>
                  <span
                    className={
                      "ml-4 rounded-full px-3 py-1 text-[11px] " +
                      (e.action === "eliminado"
                        ? "bg-foreground text-background"
                        : e.action === "archivado"
                          ? "border border-border text-foreground"
                          : "border border-dashed border-border text-muted-foreground")
                    }
                  >
                    {e.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-sm">Extensión del navegador</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Instala Carbofile en tu navegador para que el agente actúe cada vez que descargas
                algo o entras a un servicio de almacenamiento.
              </p>
              <button className="mt-4 w-full rounded-full bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition">
                Añadir a Chrome
              </button>
              <button className="mt-2 w-full rounded-full border border-border px-4 py-2 text-sm hover:border-foreground transition">
                Añadir a Arc / Edge
              </button>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm">Auto-eliminación</p>
                <button
                  onClick={() => setAutoDelete(!autoDelete)}
                  className={
                    "relative h-6 w-11 rounded-full transition " +
                    (autoDelete ? "bg-foreground" : "bg-border")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-5 w-5 rounded-full bg-background transition " +
                      (autoDelete ? "left-5" : "left-0.5")
                    }
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                El agente borra automáticamente duplicados, instaladores viejos y adjuntos
                innecesarios. Siempre puedes revertir durante 30 días.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <p className="text-sm">Servicios conectados</p>
              <ul className="mt-3 space-y-2 text-sm">
                {["Google Drive", "OneDrive", "Dropbox", "Gmail adjuntos", "Descargas locales"].map(
                  (s) => (
                    <li key={s} className="flex items-center justify-between">
                      <span>{s}</span>
                      <span className="text-[11px] text-moss">conectado</span>
                    </li>
                  ),
                )}
              </ul>
              <button className="mt-4 w-full rounded-full border border-border px-4 py-2 text-sm hover:border-foreground transition">
                Conectar otro servicio
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Sugerencia del agente
          </p>
          <p className="mt-3 text-lg font-light">
            He detectado 42 capturas de pantalla duplicadas en Descargas ocupando 128 MB. ¿Quieres
            que las elimine?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                setEvents((prev) => [
                  {
                    id: crypto.randomUUID(),
                    source: "Descargas",
                    file: "42 capturas duplicadas",
                    size: "128 MB",
                    action: "eliminado",
                    when: "ahora",
                  },
                  ...prev,
                ])
              }
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90 transition"
            >
              Eliminar todas
            </button>
            <button className="rounded-full border border-border px-5 py-2 text-sm hover:border-foreground transition">
              Revisar una a una
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
