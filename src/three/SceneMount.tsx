import { Suspense, lazy, useEffect, useState } from "react";
import planet from "@/assets/planet.jpg";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

/** Lightweight poster shown during SSR and while the WebGL chunk loads. */
function PlanetPoster() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 42%, rgba(111,127,74,0.18), transparent 70%), #161f19",
        }}
      />
      <img
        src={planet}
        alt=""
        width={1024}
        height={1024}
        decoding="async"
        fetchPriority="high"
        className="absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 select-none object-contain md:h-[70vmin] md:w-[70vmin]"
      />
    </div>
  );
}

/**
 * Real-time 3D planet (React Three Fiber). Mounted only on the client, after
 * hydration and idle, so it never blocks first paint; quality auto-degrades on
 * mobile / reduced-motion devices.
 */
export function SceneMount() {
  const [mounted, setMounted] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency ?? 8;
    setQuality(coarse || cores <= 4 ? "low" : "high");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = idle(() => setMounted(true));
    return () => window.clearTimeout(id as number);
  }, []);

  if (!mounted) return <PlanetPoster />;

  return (
    <Suspense fallback={<PlanetPoster />}>
      <Scene quality={quality} />
    </Suspense>
  );
}
