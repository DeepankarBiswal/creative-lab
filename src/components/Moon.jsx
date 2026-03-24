import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

export default function Moon({ parentRef }) {
  const moonOrbitRef = useRef();
  const moonRef = useRef();
  const BASE = import.meta.env.BASE_URL;
  // fallback to a grey color if no moon texture available
  let texture;
  try {
    texture = useTexture(`${BASE}textures/2k_moon.jpg`);
  } catch {
    texture = null;
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.2;
    moonOrbitRef.current.position.x = Math.cos(t) * 1.1;
    moonOrbitRef.current.position.z = Math.sin(t) * 1.1;
    moonRef.current.rotation.y += 0.005;
  });

  return (
    <group ref={moonOrbitRef}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          map={texture || undefined}
          color={texture ? undefined : "#aaaaaa"}
        />
      </mesh>
    </group>
  );
}
