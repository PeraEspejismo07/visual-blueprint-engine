import { Suspense, lazy } from "react";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

export function SceneMount() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: "#0a0f0c" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      {/* Subtle vignette + grain overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
