import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import planet from "@/assets/planet.jpg";
import formation from "@/assets/formation.jpg";
import planetSplit from "@/assets/planet-split.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setP(h.scrollTop / (h.scrollHeight - h.clientHeight || 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function Index() {
  const progress = useScrollProgress();

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ambient vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 animate-bg"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(111,127,74,0.10), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(198,180,230,0.06), transparent 55%)",
        }}
      />
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Nav />

      <Hero progress={progress} />
      <Stat />
      <Manifesto />
      <Fracture />
      <Formation />
      <CTA />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moss" />
          <span className="text-sm tracking-tight text-foreground">Verdant</span>
        </div>
        <nav className="hidden gap-8 text-[13px] text-muted-foreground md:flex">
          <a className="hover:text-foreground transition" href="#technology">Technology</a>
          <a className="hover:text-foreground transition" href="#impact">Impact</a>
          <a className="hover:text-foreground transition" href="#manifesto">Manifesto</a>
          <a className="hover:text-foreground transition" href="#contact">Contact</a>
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-border px-4 py-1.5 text-[13px] text-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          Request access
        </a>
      </div>
    </header>
  );
}

function Hero({ progress }: { progress: number }) {
  const y = progress * 240;
  const scale = 1 + progress * 0.15;
  return (
    <section className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pt-32 pb-10 md:px-10 md:pt-40 md:pb-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="eyebrow animate-fade-up">Introducing Verdant 01</p>
        <h1
          className="display mt-6 max-w-[14ch] text-[13vw] leading-[0.92] md:text-[7.2vw] animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Circular systems<br />for a cleaner<br />planet
        </h1>
      </div>

      <div className="pointer-events-none relative mx-auto flex w-full max-w-[1400px] flex-1 items-center justify-center">
        <img
          src={planet}
          alt="Mossy planet"
          width={1600}
          height={1200}
          className="animate-float aspect-square h-auto w-[62vw] max-w-[520px] object-contain md:w-[32vw]"
          style={{
            transform: `translateY(${-y * 0.4}px) scale(${scale})`,
            transition: "transform 0.1s linear",
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.55))",
          }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between text-[12px] text-muted-foreground animate-fade-up" style={{ animationDelay: "600ms" }}>
        <span>Next-Generation Portable<br />Waste Reclamation Technology</span>
        <span className="hidden md:inline">Scroll ↓</span>
        <span>MMXXVI / Berlin</span>
      </div>
    </section>
  );
}

function Stat() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="impact" ref={ref} className="relative z-10 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-16 md:grid-cols-12">
        <div className="md:col-span-6 md:col-start-1">
          <p className="eyebrow">The scale</p>
          <p
            className="display mt-6 text-[16vw] md:text-[9vw]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            2.01 <span className="text-muted-foreground">billion</span>
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tonnes of solid waste produced globally each year. By 2050 that number climbs to 3.4 billion — outpacing every recovery system on Earth.
          </p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <img
            src={planetSplit}
            alt=""
            loading="lazy"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full object-cover opacity-90"
            style={{
              maskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="manifesto" ref={ref} className="relative z-10 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow">Manifesto</p>
        <p
          className="mt-8 max-w-[22ch] text-[8vw] leading-[1.05] tracking-tight md:max-w-[28ch] md:text-[3.6vw]"
          style={{
            fontWeight: 300,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 1.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          Recovery obstacles and contamination crises have surpassed critical limits, and the pursuit of transformative green solutions has never{" "}
          <span className="text-muted-foreground">carried more weight.</span>
        </p>
      </div>
    </section>
  );
}

function Fracture() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative z-10 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[900px]">
          <img
            src={planetSplit}
            alt="Fractured planet"
            loading="lazy"
            width={1600}
            height={1200}
            className="h-full w-full object-contain"
            style={{
              transform: visible ? "scale(1)" : "scale(0.96)",
              opacity: visible ? 1 : 0,
              transition: "all 1.8s cubic-bezier(0.22,1,0.36,1)",
              filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6))",
            }}
          />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="display text-[12vw] leading-[0.95] md:text-[5.2vw]">
              under a fifth
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Of all refuse is reclaimed each year</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              The current infrastructure was designed for a linear world. Verdant reconstructs the loop — recovering materials at the source, converting entropy into inventory, and returning value to communities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Formation() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="technology" ref={ref} className="relative z-10 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow">The instrument</p>
        <h2 className="display mt-6 max-w-[16ch] text-[10vw] md:text-[5.6vw]">
          A quiet machine, built to disappear into the landscape.
        </h2>

        <div className="mt-20">
          <img
            src={formation}
            alt="Verdant formation"
            loading="lazy"
            width={1600}
            height={1200}
            className="mx-auto h-auto w-full max-w-[1200px] object-contain"
            style={{
              transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.98)",
              opacity: visible ? 1 : 0,
              transition: "all 1.6s cubic-bezier(0.22,1,0.36,1)",
              filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6))",
            }}
          />
        </div>

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
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="contact" className="relative z-10 px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1400px] text-center">
        <p className="eyebrow">Limited pilot 2026</p>
        <h2 className="display mx-auto mt-8 max-w-[18ch] text-[11vw] md:text-[6vw]">
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
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moss" />
          <span>Verdant Systems GmbH</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Press</a>
          <a href="#" className="hover:text-foreground">Careers</a>
          <a href="#" className="hover:text-foreground">Ethics</a>
        </div>
        <p>© MMXXVI — All matter returns.</p>
      </div>
    </footer>
  );
}
