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
    // True left/right hemisphere in local space: phi 0..PI keeps x >= 0 and
    // phi PI..2PI keeps x <= 0, so the cut plane is the vertical y-z plane and
    // the halves slide sideways with their round side facing outward.
    const seg = Math.max(32, detail * 2);
    g = new THREE.SphereGeometry(1, seg, seg, half === 1 ? 0 : Math.PI, Math.PI);
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
      // One planet that cracks open: the halves slide apart just enough to
      // reveal the fracture, never so far that they read as two planets.
      const target = split.current * 0.42 * half;
      meshRef.current.position.x += (target - meshRef.current.position.x) * Math.min(1, delta * 4.2);

      const shake = vibration.current * 0.006;
      meshRef.current.position.y = (Math.random() - 0.5) * shake;
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
      {/* Solid cut face, so a separated half reads as a sliced rock instead of
          a hollow bowl. */}
      <mesh rotation={[0, (half * Math.PI) / 2, 0]}>
        <circleGeometry args={[1.04, 64]} />
        <meshStandardMaterial color="#2b2b26" roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>
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
      // Keep the split axis facing the camera. Rotating around Y made one half
      // pass in front of the other, visually undoing the separation.
      groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * Math.min(1, delta * 2.8);
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.035 * (1 - split.current);
      groupRef.current.rotation.z = Math.sin(t * 0.16) * 0.025 * (1 - split.current);
    }
    const mat = coreRef.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) {
      mat.opacity = Math.min(1, split.current * 1.6) * 0.2 + crackGlow.current * 0.1;
    }
  });


  return (
    <group ref={groupRef} scale={0.62}>
      <PlanetHalf half={-1} split={split} crackGlow={crackGlow} vibration={vibration} detail={detail} />
      <PlanetHalf half={1} split={split} crackGlow={crackGlow} vibration={vibration} detail={detail} />
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 24, 24]} />
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
