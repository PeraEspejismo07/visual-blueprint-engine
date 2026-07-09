import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function CameraRig({ scrollY }: { scrollY: { current: number } }) {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 2.5);
    // Parallax based on mouse
    const px = mouse.x * 0.35;
    const py = mouse.y * 0.25;
    // Dolly out slightly as user scrolls into fracture
    // Fit the planet to ~30% of viewport height regardless of aspect.
    const aspect = (typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1);
    const base = aspect < 1 ? 16 : 11;
    const dolly = base + scrollY.current * 3;
    camera.position.x += (px - camera.position.x) * k;
    camera.position.y += (py - camera.position.y) * k;
    camera.position.z += (dolly - camera.position.z) * k;
    camera.lookAt(target.current);
  });
  return null;
}
