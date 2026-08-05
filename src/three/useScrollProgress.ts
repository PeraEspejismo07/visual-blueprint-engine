import { useEffect, useState } from "react";

type Listener = (p: number) => void;

const listeners = new Set<Listener>();
let progress = 0;
let raf = 0;
let attached = false;

function compute() {
  raf = 0;
  const h = document.documentElement;
  const next = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  if (Math.abs(next - progress) < 0.0005) return;
  progress = next;
  listeners.forEach((l) => l(progress));
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(compute);
}

/** Single passive scroll listener shared by every consumer (rAF throttled). */
export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  if (!attached) {
    attached = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();
  }
  listener(progress);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      attached = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
}

export function getScrollProgress() {
  return progress;
}

/** Re-renders the component on scroll — use sparingly (React state). */
export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => subscribeScroll(setP), []);
  return p;
}
