import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import SaturnRings from "./SaturnRings";
import Moon from "./Moon";
import { getAngleForDate } from "./TimeControls";
import * as THREE from "three";

export default function Planet({
  name,
  distance,
  size,
  texture,
  color,
  speed,
  tilt,
  hasRings,
  hasMoon,
  description,
  speedMultiplier,
  onSelect,
  simDate,
  useRealPositions,
}) {
  const orbitRef = useRef();
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  const tex = useTexture(texture);

  useFrame((_, delta) => {
    let angle;
    if (useRealPositions && simDate) {
      angle = getAngleForDate(name, simDate);
    } else {
      angleRef.current += delta * speed * speedMultiplier;
      angle = angleRef.current;
    }

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
          onClick={(e) => {
            e.stopPropagation();
            // Get actual world position of the planet at this exact moment
            const worldPos = new THREE.Vector3();
            orbitRef.current.getWorldPosition(worldPos);
            onSelect(worldPos);
          }}
        >
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial
            map={tex}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        </mesh>

        {hasRings && <SaturnRings />}
        {hasMoon && <Moon />}

        {hovered && (
          <Html center distanceFactor={12}>
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 13,
                  color,
                  marginBottom: 2,
                }}
              >
                {name}
              </div>
              <div style={{ opacity: 0.6 }}>{description}</div>
              <div style={{ opacity: 0.4, fontSize: 10, marginTop: 2 }}>
                click to inspect
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
