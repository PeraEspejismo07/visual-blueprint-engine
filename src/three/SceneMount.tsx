import { lazy, Suspense, useEffect, useState } from "react";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

type Mode = "off" | "low" | "high";

function detect(): Mode {
  if (typeof window === "undefined") return "off";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
  const canvas = document.createElement("canvas");
  const hasWebGL = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  if (!hasWebGL) return "off";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mobile = window.innerWidth < 768;
  if (mobile || cores <= 4) return "low";
  return "high";
}

/**
 * Mounts the WebGL scene after first paint (and after the browser is idle), so
 * the landing's HTML/CSS is interactive immediately and the three.js chunk never
 * blocks hydration.
 */
export function SceneMount() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const start = () => setMode(detect());
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number })
      .requestIdleCallback;
    if (ric) {
      const id = ric(start, { timeout: 1200 });
      return () => (window as unknown as { cancelIdleCallback?: (i: number) => void }).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 300);
    return () => window.clearTimeout(t);
  }, []);

  if (mode === null || mode === "off") return <StaticBackdrop />;

  return (
    <>
      <StaticBackdrop />
      <Suspense fallback={null}>
        <Scene quality={mode === "high" ? "high" : "low"} />
      </Suspense>
    </>
  );
}

/** Cheap CSS stand-in: paints instantly and covers the WebGL boot gap. */
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(60% 45% at 50% 42%, rgba(111,127,74,0.22), transparent 70%), #161f19",
      }}
    />
  );
}
