import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Planet } from "./Planet";
import { Orbits } from "./Orbits";
import { Particles } from "./Particles";
import { CameraRig } from "./CameraRig";
import { subscribeScroll } from "./useScrollProgress";

export function Scene({ quality = "high" }: { quality?: "high" | "low" }) {
  const scrollY = useRef(0);
  const split = useRef(0);
  const glow = useRef(0);
  const vib = useRef(0);

  useEffect(() => {
    return subscribeScroll((p) => {
      scrollY.current = p;
      // Timeline: 0-0.2 idle, 0.2-0.35 vibration + crack glow, 0.35-0.6 split.
      glow.current = THREE.MathUtils.smoothstep(p, 0.15, 0.55);
      vib.current =
        THREE.MathUtils.smoothstep(p, 0.18, 0.32) * (1 - THREE.MathUtils.smoothstep(p, 0.32, 0.42));
      split.current = THREE.MathUtils.smoothstep(p, 0.32, 0.62);
    });
  }, []);

  const cfg = useMemo(
    () =>
      quality === "high"
        ? { dpr: [1, 2] as [number, number], detail: 64, particles: 320, samples: 4 }
        : { dpr: [1, 1.5] as [number, number], detail: 24, particles: 120, samples: 0 },
    [quality],
  );

  return (
    <Canvas
      className="!fixed inset-0 z-0"
      dpr={cfg.dpr}
      performance={{ min: 0.5 }}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 0, 4.2], fov: 35, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={["#161f19"]} />
      <fog attach="fog" args={["#161f19", 10, 22]} />

      <ambientLight intensity={0.22} />
      <directionalLight position={[3, 4, 2]} intensity={1.5} color="#f6f0e0" />
      <directionalLight position={[-4, -1, -2]} intensity={0.35} color="#a8c0a0" />

      {false && <Planet split={split} crackGlow={glow} vibration={vib} detail={cfg.detail} />}
      <Orbits />
      <Particles count={cfg.particles} spread={7} />

      <CameraRig scrollY={scrollY} />

      <EffectComposer multisampling={cfg.samples} enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.8} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
