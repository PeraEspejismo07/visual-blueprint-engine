import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { planetVertex, planetFragment } from "./shaders";

type Ref = { current: number };

type Props = {
  half: -1 | 1;
  split: Ref;
  crackGlow: Ref;
  vibration: Ref;
  detail: number;
};

// One geometry instance shared by both halves (they are clipped, not cut),
// so the heavy icosphere is only built and uploaded to the GPU once.
const geometryCache = new Map<string, THREE.SphereGeometry>();
function getGeometry(detail: number, half: -1 | 1) {
  const key = `${detail}:${half}`;
  let g = geometryCache.get(key);
  if (!g) {
    // True hemisphere in local space: the cut plane rotates and travels with
    // the mesh, so the fracture stays clean at any separation or rotation.
    const seg = Math.max(32, detail * 2);
    g = new THREE.SphereGeometry(1, seg, seg, half === 1 ? -Math.PI / 2 : Math.PI / 2, Math.PI);
    geometryCache.set(key, g);
  }
  return g;
}

export function PlanetHalf({ half, split, crackGlow, vibration, detail }: Props) {
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

  const geometry = useMemo(() => getGeometry(detail, half), [detail, half]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uCrackGlow.value = crackGlow.current;
    }
    if (meshRef.current) {
      const target = split.current * 0.55 * half;
      meshRef.current.position.x += (target - meshRef.current.position.x) * Math.min(1, delta * 3.5);

      const shake = vibration.current * 0.006;
      meshRef.current.position.y = Math.sin(t * 1.6) * 0.04 + (Math.random() - 0.5) * shake;

      meshRef.current.rotation.y += delta * 0.04 * (1 - split.current * 0.85);
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={planetVertex}
        fragmentShader={planetFragment}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function Planet({
  split,
  crackGlow,
  vibration,
  detail = 64,
}: {
  split: Ref;
  crackGlow: Ref;
  vibration: Ref;
  detail?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
      groupRef.current.rotation.y += delta * 0.05 * (1 - split.current * 0.9);
    }
    const mat = coreRef.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) {
      mat.opacity = Math.min(1, split.current * 1.6) * 0.45 + crackGlow.current * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={0.8}>
      <PlanetHalf half={-1} split={split} crackGlow={crackGlow} vibration={vibration} detail={detail} />
      <PlanetHalf half={1} split={split} crackGlow={crackGlow} vibration={vibration} detail={detail} />
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial
          color={"#fff8e0"}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
