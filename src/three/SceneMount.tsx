import { lazy, Suspense, useEffect, useState } from "react";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

export function SceneMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
