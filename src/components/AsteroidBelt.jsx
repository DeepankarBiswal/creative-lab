import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ASTEROID_COUNT = 800;
const INNER_RADIUS = 14.5;
const OUTER_RADIUS = 16.5;

export default function AsteroidBelt() {
  const meshRef = useRef();

  const { positions, rotations } = useMemo(() => {
    const positions = [];
    const rotations = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius =
        INNER_RADIUS + Math.random() * (OUTER_RADIUS - INNER_RADIUS);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.6;
      positions.push(x, y, z);
      rotations.push(Math.random() * Math.PI * 2);
    }
    return { positions: new Float32Array(positions), rotations };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#a09080"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}
