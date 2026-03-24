import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

export default function Sun() {
  const ref = useRef();
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/2k_sun.jpg`);


  useFrame(() => {
    ref.current.rotation.y += 0.001;
  });

  return (
    <group>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[2.9, 32, 32]} />
        <meshBasicMaterial color="#ffa500" transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.1, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.04} />
      </mesh>
      {/* Sun body */}
      <mesh ref={ref}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ff8800"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}
