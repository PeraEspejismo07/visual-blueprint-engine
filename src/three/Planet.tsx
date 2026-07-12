import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { planetVertex, planetFragment } from "./shaders";

export function Planet({ scroll }: { scroll: { current: number } }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScroll: { value: 0 } }),
    [],
  );

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt;
      matRef.current.uniforms.uScroll.value +=
        (scroll.current - matRef.current.uniforms.uScroll.value) * 0.06;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.06;
      groupRef.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={2.2}>
      <mesh>
        <icosahedronGeometry args={[1, 96]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={planetVertex}
          fragmentShader={planetFragment}
          uniforms={uniforms}
        />
      </mesh>
      {/* atmosphere rim */}
      <mesh scale={1.08}>
        <icosahedronGeometry args={[1, 32]} />
        <meshBasicMaterial color="#00e676" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
