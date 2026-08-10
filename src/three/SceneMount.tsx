import planet from "@/assets/planet.jpg";

/**
 * Static planet backdrop. Intentionally zero WebGL / zero animation:
 * one image + a CSS gradient, so the landing costs almost nothing to render.
 */
export function SceneMount() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 42%, rgba(111,127,74,0.18), transparent 70%), #0d120f",
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
