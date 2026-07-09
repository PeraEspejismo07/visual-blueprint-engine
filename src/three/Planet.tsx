import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { planetVertex, planetFragment } from "./shaders";

type Props = {
  half: -1 | 1;
  split: number; // 0..1 how far the halves are separated
  crackGlow: number; // 0..1
  vibration: number; // 0..1
};

export function PlanetHalf({ half, split, crackGlow, vibration }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisplace: { value: 0.32 },
      uWind: { value: 1.0 },
      uCrackGlow: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.6, 0.8, 0.4).normalize() },
    }),
    [],
  );

  // Hemisphere geometry: full sphere clipped to one half via clipping plane.
  // Using a full high-poly icosphere, then a shader-side world-space clip via
  // discarding fragments on the wrong side of Y=0 in local space.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 48), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uCrackGlow.value = crackGlow;
    }
    if (meshRef.current) {
      // Separation along X for a clean "book opening" split.
      const target = split * 0.55 * half;
      meshRef.current.position.x += (target - meshRef.current.position.x) * Math.min(1, delta * 3.5);

      // Vibration: high-frequency micro shake before fracture.
      const shake = vibration * 0.006;
      meshRef.current.position.y = Math.sin(t * 1.6) * 0.04 + (Math.random() - 0.5) * shake;

      // Independent slow rotation once separated.
      meshRef.current.rotation.y += delta * (0.04 + split * 0.05 * half);
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={planetVertex}
        fragmentShader={planetFragment}
        clippingPlanes={[new THREE.Plane(new THREE.Vector3(half, 0, 0), 0)]}
        clipShadows
      />
    </mesh>
  );
}

export function Planet({
  split,
  crackGlow,
  vibration,
}: {
  split: number;
  crackGlow: number;
  vibration: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
    groupRef.current.rotation.y += delta * 0.05;
  });
  return (
    <group ref={groupRef}>
      <PlanetHalf half={-1} split={split} crackGlow={crackGlow} vibration={vibration} />
      <PlanetHalf half={1} split={split} crackGlow={crackGlow} vibration={vibration} />
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial
          color={"#fff8e0"}
          transparent
          opacity={Math.min(1, split * 1.5) * 0.35 + crackGlow * 0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
