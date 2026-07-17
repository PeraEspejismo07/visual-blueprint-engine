import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SceneMount } from "@/three/SceneMount";

export const Route = createFileRoute("/")({
  component: Index,
});

function useScroll() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setP(h.scrollTop / (h.scrollHeight - h.clientHeight || 1));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return p;
}

function Index() {
  const p = useScroll();

  return (
    <main className="relative min-h-[500vh] bg-background text-foreground">
      <SceneMount />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Nav />

      {/* Sección 1 — Hero */}
      <section className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pt-32 pb-10 md:px-10 md:pt-40">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="eyebrow animate-fade-up">Presentamos Carbofile</p>
          <h1
            className="display mt-6 max-w-[14ch] text-[13vw] md:text-[7.2vw] animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            Menos archivos.<br />Menos huella.<br />Más planeta.
          </h1>

          <div
            className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90"
            >
              Registrarme
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm text-foreground transition hover:border-foreground"
            >
              Iniciar sesión
            </Link>
            <a
              href="#tecnologia"
              className="inline-flex items-center justify-center rounded-full border border-dashed border-border px-6 py-3 text-sm text-foreground transition hover:border-foreground"
            >
              Agendar demo
            </a>
          </div>
        </div>

        <div
          className="mx-auto flex w-full max-w-[1400px] items-end justify-between text-[12px] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "700ms" }}
        >
          <span>
            Agente de IA en tu navegador<br />para limpiar lo que ya no necesitas
          </span>
          <span className="hidden md:inline">Desliza ↓</span>
          <span>MMXXVI / Berlín</span>
        </div>
      </section>



      {/* Sección 2 — Escala */}
      <section className="relative z-10 flex min-h-[100svh] items-end px-6 pb-24 md:px-10">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow">La escala</p>
            <p className="display mt-6 text-[16vw] md:text-[9vw]">
              328 <span className="text-muted-foreground">millones de toneladas</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              De CO₂ se emiten cada año únicamente para almacenar datos que nadie volverá a abrir.
              Cada archivo duplicado, cada instalador olvidado, cada adjunto sin leer pesa.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 3 — Manifiesto */}
      <section className="relative z-10 flex min-h-[100svh] items-center px-6 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">Manifiesto</p>
          <p
            className="mt-8 max-w-[22ch] text-[8vw] leading-[1.05] tracking-tight md:max-w-[28ch] md:text-[3.6vw]"
            style={{ fontWeight: 300 }}
          >
            La nube no es una nube: son centros de datos ardiendo. Guardamos todo por si acaso, y
            ese «por si acaso» pesa{" "}
            <span className="text-muted-foreground">más que cualquier bosque.</span>
          </p>
        </div>
      </section>

      {/* Sección 4 — Fractura */}
      <section className="relative z-10 flex min-h-[100svh] items-end px-6 pb-32 md:px-10">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="display text-[12vw] leading-[0.95] md:text-[5.2vw]">
              menos de un tercio
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              De los archivos que guardas se vuelven a abrir alguna vez
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Carbofile es un agente de IA que vive en tu navegador. Cada vez que descargas algo o
              entras a Google Drive, OneDrive o Dropbox, analiza qué merece la pena conservar y
              borra el resto por ti — con tu permiso y con memoria reversible.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 5 — El instrumento / CTA */}
      <section id="tecnologia" className="relative z-10 px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">El agente</p>
          <h2 className="display mt-6 max-w-[16ch] text-[10vw] md:text-[5.4vw]">
            Silencioso, autónomo, siempre a tu favor.
          </h2>

          <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4">
            {[
              ["01", "En tu navegador", "Extensión ligera para Chrome, Arc, Edge y Brave."],
              ["02", "Multi-nube", "Google Drive, OneDrive, Dropbox, iCloud y Gmail adjuntos."],
              ["03", "Con IA", "Detecta duplicados, versiones antiguas y basura digital."],
              ["04", "Reversible", "Todo lo eliminado se puede recuperar durante 30 días."],
            ].map(([n, title, body]) => (
              <div key={n}>
                <p className="text-xs text-muted-foreground">{n}</p>
                <p className="mt-6 text-lg text-foreground">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <p className="eyebrow">Beta abierta 2026</p>
            <h2 className="display mx-auto mt-8 max-w-[18ch] text-[11vw] md:text-[5.6vw]">
              Empieza a limpiar tu huella digital.
            </h2>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 text-sm text-background transition hover:opacity-90"
              >
                Crear mi cuenta
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm text-foreground transition hover:border-foreground"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-moss" />
            <span>Carbofile Systems</span>
          </div>
          <p>© MMXXVI — Menos bytes, más planeta. {(p * 100).toFixed(0)}%</p>
        </div>
      </footer>
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moss" />
          <span className="text-sm tracking-tight">Carbofile</span>
        </Link>
        <nav className="hidden gap-8 text-[13px] text-muted-foreground md:flex">
          <a className="hover:text-foreground transition" href="#tecnologia">Tecnología</a>
          <a className="hover:text-foreground transition" href="#tecnologia">Impacto</a>
          <a className="hover:text-foreground transition" href="#tecnologia">Manifiesto</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden md:inline-flex text-[13px] text-muted-foreground hover:text-foreground transition"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/auth"
            className="rounded-full border border-border px-4 py-1.5 text-[13px] hover:bg-foreground hover:text-background transition-colors"
          >
            Registrarme
          </Link>
        </div>
      </div>
    </header>
  );
}
