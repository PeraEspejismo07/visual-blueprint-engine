import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Puzzle, ChevronRight, Leaf, Shield, LineChart, Users, Check } from "lucide-react";
import { SceneMount } from "@/three/SceneMount";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CarboFile — Cuida el planeta, empieza por lo que ya no ves" },
      {
        name: "description",
        content:
          "Extensión que limpia pestañas duplicadas, descargas olvidadas y archivos redundantes en Drive. Mide la energía y el CO2 que ahorras.",
      },
      { property: "og:title", content: "CarboFile — Reduce tu huella digital" },
      { property: "og:description", content: "Encuentra lo invisible en tu navegador y tu nube." },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          CarboFile
        </Link>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#como" className="hover:text-foreground">Cómo funciona</a>
          <a href="#impacto" className="hover:text-foreground">Impacto</a>
          <a href="#pricing" className="hover:text-foreground">Precios</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-primary">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Registrarte
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Beta abierta · sin tarjeta
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Cuida el planeta.<br />
          <span className="text-primary">Empieza por lo que ya no ves.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          CarboFile es la extensión que vive en tu navegador y tu nube — encuentra pestañas duplicadas,
          descargas olvidadas y archivos redundantes en Drive, y te muestra cuánta energía y CO₂ ahorras
          al liberarlos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Puzzle className="h-4 w-4" /> Instalar CarboFile gratis
          </a>
          <a
            href="#empresas"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            Ver para empresas <ChevronRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Instala", d: "Añade la extensión a tu navegador en un clic, sin descargas pesadas ni permisos complicados." },
    { n: "02", t: "Analiza", d: "Detecta pestañas duplicadas, descargas olvidadas y archivos redundantes en tu Google Drive conectado." },
    { n: "03", t: "Tú decides", d: "Apruebas qué se limpia. Nunca borramos nada sin tu confirmación." },
  ];
  return (
    <section id="como" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Tres pasos, cero complicaciones</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <div className="text-sm font-mono text-primary">{s.n}</div>
              <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const stats = [
    { n: "2–4%", t: "El almacenamiento en la nube representa el 2-4% de las emisiones globales de CO₂." },
    { n: "50 kg", t: "1 TB almacenado durante un año equivale hasta a 50 kg de CO₂." },
    { n: "30%", t: "Los archivos duplicados representan hasta el 30% del almacenamiento personal." },
  ];
  return (
    <section id="impacto" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Impacto real</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Los números importan</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-surface p-8 text-center"
            >
              <div className="text-5xl font-semibold text-primary">{s.n}</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.t}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DualTabs() {
  return (
    <section id="empresas" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Users className="h-3 w-3" /> Para ti
            </div>
            <h3 className="text-2xl font-semibold">Cuida el planeta. Empieza por lo que ya no ves.</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Limpia tu navegador y tu nube desde una extensión ligera. Mira tu impacto acumulado, tu racha
              de días activos, y compárate con otros usuarios.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:brightness-110"
            >
              Empezar gratis <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <LineChart className="h-3 w-3" /> Para empresas
            </div>
            <h3 className="text-2xl font-semibold">Ahorra en la nube. Reduce tu huella. Así de simple.</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Optimiza tu infraestructura cloud y reduce tu factura mientras cumples tus reportes ESG.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary">
              Solicitar demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Transparency() {
  const items = [
    "No inventamos números: usamos metodologías públicas y citables.",
    "Nunca borramos automáticamente sin tu aprobación.",
    "Solo leemos metadata, nunca accedemos al contenido de tus archivos.",
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-xs uppercase tracking-widest text-primary">Transparencia</p>
        </div>
        <div className="space-y-4">
          {items.map((t, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-sm leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Personal", price: "Gratis", desc: "Extensión + reporte básico", cta: "Instalar", featured: false },
    { name: "Personal Pro", price: "$4–7/mes", desc: "Escaneos automáticos, detección con IA, reportes mensuales", cta: "Empezar prueba", featured: true },
    { name: "Empresas", price: "Contactar", desc: "Optimización de infraestructura cloud, reducción de factura y huella", cta: "Hablar con ventas", featured: false },
  ];
  return (
    <section id="pricing" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Precios</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Elige lo que se ajusta a ti</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-8 ${p.featured ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-4 text-4xl font-semibold">{p.price}</div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <button
                className={`mt-6 w-full rounded-lg py-2.5 text-sm font-medium transition ${
                  p.featured
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-xs text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" /> CarboFile — Cuida el planeta.
        </div>
        <p>© 2026 CarboFile</p>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <HowItWorks />
      <Impact />
      <DualTabs />
      <Transparency />
      <Pricing />
      <Footer />
    </main>
  );
}
