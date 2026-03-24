import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import SaturnRings from "./SaturnRings";

export default function Planet({
  name,
  distance,
  size,
  texture,
  color,
  speed,
  tilt,
  hasRings,
  description,
  speedMultiplier,
}) {
  const orbitRef = useRef();
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(() => Math.random() * Math.PI * 2); // stagger start

  const tex = useTexture(texture);

  useFrame((_, delta) => {
    setAngle((a) => a + delta * speed * speedMultiplier);
    orbitRef.current.position.x = Math.cos(angle) * distance;
    orbitRef.current.position.z = Math.sin(angle) * distance;
    planetRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={orbitRef}>
      <group ref={planetRef} rotation={[tilt, 0, 0]}>
        <mesh
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial
            map={tex}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>

        {hasRings && <SaturnRings />}

        {hovered && (
          <Html center distanceFactor={12}>
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 14px",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: "12px",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#f0c060",
                  marginBottom: "2px",
                }}
              >
                {name}
              </div>
              <div style={{ opacity: 0.7 }}>{description}</div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
