import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useControls, Leva } from "leva";
import { Suspense, useState, useRef } from "react";
import * as THREE from "three";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import AsteroidBelt from "./AsteroidBelt";
import InfoPanel from "./InfoPanel";
import { PLANETS } from "../data/planets";

// Camera fly-to controller
function CameraController({ target, onArrived }) {
  const { camera } = useThree();
  const animating = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  if (target) {
    animating.current = true;
    targetPos.current.set(
      target.x + target.offset,
      target.y + target.offset * 0.5,
      target.z + target.offset,
    );
    targetLook.current.set(target.x, target.y, target.z);
  }

  useFrame(() => {
    if (!animating.current || !target) return;
    camera.position.lerp(targetPos.current, 0.04);
    const dist = camera.position.distanceTo(targetPos.current);
    if (dist < 0.3) {
      animating.current = false;
      onArrived();
    }
  });

  return null;
}

function Scene({
  speedMultiplier,
  onPlanetSelect,
  cameraTarget,
  onCameraArrived,
  onBackgroundClick,
}) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight
        position={[0, 0, 0]}
        intensity={4}
        color="#fff5c0"
        distance={200}
        decay={1.2}
      />
      <Stars
        radius={300}
        depth={80}
        count={7000}
        factor={4}
        saturation={0.5}
        fade
      />
      <Sun />
      <AsteroidBelt />
      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} distance={p.distance} />
      ))}
      {PLANETS.map((p) => (
        <Planet
          key={p.name}
          {...p}
          speedMultiplier={speedMultiplier}
          onSelect={() => onPlanetSelect(p)}
        />
      ))}
      <CameraController target={cameraTarget} onArrived={onCameraArrived} />
      {/* Invisible background mesh to detect clicks on empty space */}
      <mesh onClick={onBackgroundClick}>
        <sphereGeometry args={[400, 8, 8]} />
        <meshBasicMaterial side={THREE.BackSide} transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const controlsRef = useRef();

  const { speedMultiplier } = useControls("Solar System", {
    speedMultiplier: { value: 0.5, min: 0, max: 5, step: 0.01, label: "Speed" },
  });

  const handlePlanetSelect = (planet) => {
    setSelectedPlanet(planet);
    // We use a fixed offset for fly-to; real position is animated in Planet.jsx
    // so we aim at approximate orbit position
    const angle = Math.random() * Math.PI * 2;
    setCameraTarget({
      x: Math.cos(angle) * planet.distance,
      y: 0,
      z: Math.sin(angle) * planet.distance,
      offset: planet.size * 6 + 3,
    });
    if (controlsRef.current) controlsRef.current.enabled = false;
  };

  const handleClose = () => {
    setSelectedPlanet(null);
    setCameraTarget(null);
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000005" }}>
      <Leva
        theme={{
          colors: {
            highlight1: "#f0c060",
            highlight2: "#f0c060",
            accent1: "#f0c060",
            accent2: "#f0c060",
            accent3: "#f0c060",
          },
        }}
        titleBar={{ title: "⚙️ Controls" }}
      />

      {/* HUD */}
      <div
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 10,
          fontFamily: "'Courier New', monospace",
          color: "rgba(255,255,255,0.5)",
          fontSize: "11px",
          lineHeight: 2,
          pointerEvents: "none",
          letterSpacing: "0.1em",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#f0c060",
            letterSpacing: "0.3em",
            marginBottom: 4,
          }}
        >
          ☀ SOLAR SYSTEM
        </div>
        <div>🖱 DRAG — orbit view</div>
        <div>🖱 SCROLL — zoom</div>
        <div>🖱 CLICK planet — inspect</div>
      </div>

      <InfoPanel planet={selectedPlanet} onClose={handleClose} />

      <Canvas
        camera={{ position: [0, 28, 55], fov: 55 }}
        gl={{ antialias: true, toneMapping: 3 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            speedMultiplier={speedMultiplier}
            onPlanetSelect={handlePlanetSelect}
            cameraTarget={cameraTarget}
            onCameraArrived={() => {
              if (controlsRef.current) controlsRef.current.enabled = true;
            }}
            onBackgroundClick={handleClose}
          />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          minDistance={5}
          maxDistance={150}
          zoomSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
