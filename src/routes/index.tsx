import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Chrome, Download, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { SceneMount } from "@/three/SceneMount";
import { useScrollProgress } from "@/three/useScrollProgress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carbofile — Menos archivos, menos huella, más planeta" },
      {
        name: "description",
        content:
          "Carbofile es el agente de IA en tu navegador que borra los archivos que ya no necesitas y convierte cada limpieza en CO₂ evitado.",
      },
      { property: "og:title", content: "Carbofile — Menos archivos, menos huella" },
      {
        property: "og:description",
        content: "Agente de IA que limpia tu basura digital y mide el CO₂ que evitas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const p = useScrollProgress();


  return (
    <main className="relative min-h-[700vh] bg-background text-foreground">
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
              2.010 <span className="text-muted-foreground">millones</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              De gigabytes de datos se crean cada día. Descargas duplicadas, instaladores, capturas y
              adjuntos olvidados siguen ocupando discos y centros de datos mucho después de ser útiles.
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
            La basura digital es invisible, pero mantenerla disponible consume energía cada segundo.
            Carbofile convierte la limpieza cotidiana en una acción automática y medible. {" "}
            <span className="text-muted-foreground">Tu navegador hace el trabajo silenciosamente.</span>
          </p>
        </div>
      </section>

      {/* Sección 4 — Fractura */}
      <section className="relative z-10 flex min-h-[100svh] items-end px-6 pb-32 md:px-10">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="display text-[12vw] leading-[0.95] md:text-[5.2vw]">
              menos de una quinta parte
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              De los archivos descargados vuelve a utilizarse después de 90 días
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Carbofile detecta duplicados, instaladores antiguos, capturas y archivos pesados desde
              el navegador. Tú decides si solo sugiere o limpia automáticamente, con historial y
              reversión desde el panel.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 5 — El instrumento / CTA */}
      <section id="tecnologia" className="relative z-10 px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">El instrumento</p>
          <h2 className="display mt-6 max-w-[16ch] text-[10vw] md:text-[5.4vw]">
            Un agente silencioso, integrado en el navegador.
          </h2>

          <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4">
            {[
               ["01", "Local", "Analiza tus descargas en el navegador; tus archivos no salen del equipo."],
               ["02", "Inteligente", "Reconoce duplicados, versiones antiguas, capturas e instaladores."],
               ["03", "Reversible", "Revisa cada acción y recupera elementos durante la ventana configurada."],
               ["04", "Medible", "Convierte espacio liberado en métricas claras de impacto ambiental."],
            ].map(([n, title, body]) => (
              <div key={n}>
                <p className="text-xs text-muted-foreground">{n}</p>
                <p className="mt-6 text-lg text-foreground">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <p className="eyebrow">Piloto limitado 2026</p>
            <h2 className="display mx-auto mt-8 max-w-[18ch] text-[11vw] md:text-[5.6vw]">
              Trae Carbofile a tu ciudad.
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
              <a
                href="mailto:hola@carbofile.com?subject=Agendar%20demo"
                className="inline-flex items-center justify-center rounded-full border border-dashed border-border px-7 py-3 text-sm text-foreground transition hover:border-foreground"
              >
                Agendar demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 6 — Navegadores */}
      <section id="navegadores" className="relative z-10 border-y border-border px-6 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="eyebrow">Una extensión · cuatro navegadores</p>
              <h2 className="display mt-6 max-w-[13ch] text-[11vw] md:text-[5.2vw]">
                Instala una vez. Limpia mientras navegas.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">
              Compatible con Google Chrome, Microsoft Edge, Opera, Brave y otros navegadores basados en Chromium.
              Carbofile observa nuevas descargas, aplica tus reglas y sincroniza solo las métricas con el panel.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 border-l border-t border-border md:grid-cols-4">
            {["Google Chrome", "Microsoft Edge", "Opera", "Brave / Chromium"].map((browser) => (
              <div key={browser} className="flex min-h-32 items-center gap-3 border-b border-r border-border p-5">
                <Chrome className="h-5 w-5 text-moss" aria-hidden />
                <span className="text-sm">{browser}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-moss" /> Análisis local</span>
            <span className="flex items-center gap-2"><Gauge className="h-4 w-4 text-moss" /> Bajo consumo</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-moss" /> Reglas inteligentes</span>
          </div>
        </div>
      </section>

      {/* Sección 7 — Precios */}
      <section id="precios" className="relative z-10 px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">Precios simples</p>
          <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
            <h2 className="display max-w-[12ch] text-[12vw] md:col-span-7 md:text-[5.4vw]">Empieza gratis. Limpia sin límites cuando lo necesites.</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">
              Sin permanencia. La pasarela de pago estará disponible en el lanzamiento; hoy puedes crear tu cuenta y probar el agente.
            </p>
          </div>

          <div className="mt-16 grid border-l border-t border-border md:grid-cols-2">
            <article className="border-b border-r border-border p-7 md:p-10">
              <p className="text-sm">Free</p>
              <div className="mt-8 flex items-end gap-2"><span className="display text-6xl">€0</span><span className="mb-1 text-xs text-muted-foreground">para siempre</span></div>
              <p className="mt-5 max-w-sm text-sm text-muted-foreground">Para mantener tus descargas bajo control en un equipo.</p>
              <ul className="mt-8 space-y-3 text-sm">
                {["1 navegador", "Análisis de nuevas descargas", "Sugerencias de limpieza", "Panel de impacto básico"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-moss" />{item}</li>
                ))}
              </ul>
              <Link to="/auth" className="mt-10 inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm transition hover:border-foreground">Crear cuenta gratis</Link>
            </article>

            <article className="relative border-b border-r border-border bg-surface/60 p-7 md:p-10">
              <span className="absolute right-7 top-7 text-[10px] uppercase tracking-widest text-moss">Recomendado</span>
              <p className="text-sm">Pro</p>
              <div className="mt-8 flex items-end gap-2"><span className="display text-6xl">€4,99</span><span className="mb-1 text-xs text-muted-foreground">/ mes</span></div>
              <p className="mt-5 max-w-sm text-sm text-muted-foreground">Para automatizar la limpieza en todos tus navegadores y servicios.</p>
              <ul className="mt-8 space-y-3 text-sm">
                {["Navegadores ilimitados", "Limpieza automática configurable", "Google Drive, Gmail, OneDrive y Dropbox", "Historial, reversión y métricas completas"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-moss" />{item}</li>
                ))}
              </ul>
              <Link to="/auth" className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90"><Download className="h-4 w-4" />Probar Pro</Link>
            </article>
          </div>
        </div>
      </section>


      <footer className="relative z-10 border-t border-border px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-moss" />
            <span>Carbofile Systems</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition">Privacidad</Link>
            <Link to="/terms" className="hover:text-foreground transition">Términos</Link>
            <a href="mailto:hola@carbofile.com" className="hover:text-foreground transition">Contacto</a>
          </nav>
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
          <a className="hover:text-foreground transition" href="#navegadores">Navegadores</a>
          <a className="hover:text-foreground transition" href="#precios">Precios</a>
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
