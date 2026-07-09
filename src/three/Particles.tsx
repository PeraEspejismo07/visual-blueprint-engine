import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Particles({ count = 600, spread = 6 }: { count?: number; spread?: number }) {
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

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    const attr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      attr.array[iy] = (attr.array[iy] as number) + speeds[i] * 0.005;
      if ((attr.array[iy] as number) > spread / 2) attr.array[iy] = -spread / 2;
      attr.array[i * 3] += Math.sin(t * 0.2 + i) * 0.0008;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
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
