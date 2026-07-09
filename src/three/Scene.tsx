import { Canvas } from "@react-three/fiber";
import { Environment, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Planet } from "./Planet";
import { Orbits } from "./Orbits";
import { Particles } from "./Particles";
import { CameraRig } from "./CameraRig";

export function Scene() {
  const scrollY = useRef(0);
  const [split, setSplit] = useState(0);
  const [glow, setGlow] = useState(0);
  const [vib, setVib] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      scrollY.current = p;
      // Timeline: 0-0.2 idle, 0.2-0.35 vibrate + crack glow rises,
      // 0.35-0.6 split opens, 0.6-1 fully separated with slow drift.
      const glowP = THREE.MathUtils.smoothstep(p, 0.15, 0.55);
      const vibP =
        THREE.MathUtils.smoothstep(p, 0.18, 0.32) *
        (1 - THREE.MathUtils.smoothstep(p, 0.32, 0.42));
      const splitP = THREE.MathUtils.smoothstep(p, 0.32, 0.62);
      setGlow(glowP);
      setVib(vibP);
      setSplit(splitP);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Canvas
      className="!fixed inset-0 z-0"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
      }}
      camera={{ position: [0, 0, 6.5], fov: 28, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={["#161f19"]} />
      <fog attach="fog" args={["#161f19", 6, 14]} />

      <Suspense fallback={null}>
        <Environment preset="forest" environmentIntensity={0.35} />
      </Suspense>

      <ambientLight intensity={0.15} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.4}
        color="#f6f0e0"
        castShadow
      />
      <directionalLight position={[-4, -1, -2]} intensity={0.35} color="#a8c0a0" />
      <pointLight position={[0, 0, 0]} intensity={split * 3} color="#fff4c8" distance={4} />

      <Planet split={split} crackGlow={glow} vibration={vib} />
      <Orbits />
      <Particles count={500} spread={7} />

      <CameraRig scrollY={scrollY} />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.35}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
