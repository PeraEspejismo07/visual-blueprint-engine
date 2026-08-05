import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Particles({ count = 320, spread = 6 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6;
      speeds[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions, speeds };
  }, [count, spread]);

  // Drift the whole cloud on the GPU-friendly path: only mutate Y and wrap.
  useFrame(() => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const half = spread / 2;
    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      arr[iy] += speeds[i]! * 0.005;
      if (arr[iy]! > half) arr[iy] = -half;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        sizeAttenuation
        color="#eae6df"
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}
