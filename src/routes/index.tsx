import { createFileRoute } from "@tanstack/react-router";
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
      {/* WebGL scene is fixed behind everything */}
      <SceneMount />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Nav />

      {/* Section 1 — Hero */}
      <section className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pt-32 pb-10 md:px-10 md:pt-40">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="eyebrow animate-fade-up">Introducing Verdant 01</p>
          <h1
            className="display mt-6 max-w-[14ch] text-[13vw] md:text-[7.2vw] animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            Circular systems<br />for a cleaner<br />planet
          </h1>
        </div>
        <div
          className="mx-auto flex w-full max-w-[1400px] items-end justify-between text-[12px] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "700ms" }}
        >
          <span>
            Next-Generation Portable<br />Waste Reclamation Technology
          </span>
          <span className="hidden md:inline">Scroll ↓</span>
          <span>MMXXVI / Berlin</span>
        </div>
      </section>

      {/* Section 2 — Stat, appears while planet starts to vibrate */}
      <section className="relative z-10 flex min-h-[100svh] items-end px-6 pb-24 md:px-10">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow">The scale</p>
            <p className="display mt-6 text-[16vw] md:text-[9vw]">
              2.01 <span className="text-muted-foreground">billion</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Tonnes of solid waste produced globally each year. By 2050 the figure
              climbs to 3.4 billion — outpacing every recovery system on Earth.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Manifesto, cracks glow */}
      <section className="relative z-10 flex min-h-[100svh] items-center px-6 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">Manifesto</p>
          <p
            className="mt-8 max-w-[22ch] text-[8vw] leading-[1.05] tracking-tight md:max-w-[28ch] md:text-[3.6vw]"
            style={{ fontWeight: 300 }}
          >
            Recovery obstacles and contamination crises have surpassed critical limits,
            and the pursuit of transformative green solutions has never{" "}
            <span className="text-muted-foreground">carried more weight.</span>
          </p>
        </div>
      </section>

      {/* Section 4 — Fracture (planet has opened) */}
      <section className="relative z-10 flex min-h-[100svh] items-end px-6 pb-32 md:px-10">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="display text-[12vw] leading-[0.95] md:text-[5.2vw]">
              under a fifth
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Of all refuse is reclaimed each year
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              The current infrastructure was designed for a linear world. Verdant
              reconstructs the loop — recovering materials at the source, converting
              entropy into inventory, and returning value to communities.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — Instrument grid, CTA */}
      <section id="technology" className="relative z-10 px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">The instrument</p>
          <h2 className="display mt-6 max-w-[16ch] text-[10vw] md:text-[5.4vw]">
            A quiet machine, built to disappear into the landscape.
          </h2>

          <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4">
            {[
              ["01", "Modular", "Deploys in under nine minutes without foundation work."],
              ["02", "Circular", "94% of processed matter re-enters supply chains."],
              ["03", "Autonomous", "Solar-native. Silent. Runs unattended for 180 days."],
              ["04", "Regenerative", "Restores soil biology in the immediate perimeter."],
            ].map(([n, title, body]) => (
              <div key={n}>
                <p className="text-xs text-muted-foreground">{n}</p>
                <p className="mt-6 text-lg text-foreground">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <p className="eyebrow">Limited pilot 2026</p>
            <h2 className="display mx-auto mt-8 max-w-[18ch] text-[11vw] md:text-[5.6vw]">
              Bring Verdant to your city.
            </h2>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 text-sm text-background transition hover:bg-highlight"
              >
                Request pilot
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm text-foreground transition hover:border-foreground"
              >
                Download whitepaper
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-moss" />
            <span>Verdant Systems GmbH</span>
          </div>
          <p>© MMXXVI — All matter returns. {(p * 100).toFixed(0)}%</p>
        </div>
      </footer>
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moss" />
          <span className="text-sm tracking-tight">Verdant</span>
        </div>
        <nav className="hidden gap-8 text-[13px] text-muted-foreground md:flex">
          <a className="hover:text-foreground transition" href="#technology">Technology</a>
          <a className="hover:text-foreground transition" href="#technology">Impact</a>
          <a className="hover:text-foreground transition" href="#technology">Manifesto</a>
        </nav>
        <a
          href="#technology"
          className="rounded-full border border-border px-4 py-1.5 text-[13px] hover:bg-foreground hover:text-background transition-colors"
        >
          Request access
        </a>
      </div>
    </header>
  );
}
