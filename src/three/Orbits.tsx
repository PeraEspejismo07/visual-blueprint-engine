import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Ring({
  radius,
  tilt,
  speed,
  opacity,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.995, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref} rotation={tilt}>
      <line>
        <primitive object={geo} attach="geometry" />
        <lineBasicMaterial color="#eae6df" transparent opacity={opacity} depthWrite={false} />
      </line>
    </group>
  );
}

export function Orbits() {
  return (
    <group>
      <Ring radius={1.9} tilt={[0.4, 0, 0.2]} speed={0.08} opacity={0.25} />
      <Ring radius={2.25} tilt={[-0.3, 0.5, -0.1]} speed={-0.05} opacity={0.18} />
      <Ring radius={2.6} tilt={[0.2, -0.4, 0.6]} speed={0.03} opacity={0.12} />
    </group>
  );
}
