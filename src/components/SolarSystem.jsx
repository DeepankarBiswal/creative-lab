import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useControls, Leva } from "leva";
import { Suspense } from "react";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import { PLANETS } from "../data/planets";

function Scene({ speedMultiplier }) {
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
      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} distance={p.distance} />
      ))}
      {PLANETS.map((p) => (
        <Planet key={p.name} {...p} speedMultiplier={speedMultiplier} />
      ))}
    </>
  );
}

export default function SolarSystem() {
  const { speedMultiplier, showOrbits } = useControls("Solar System", {
    speedMultiplier: { value: 0.5, min: 0, max: 5, step: 0.01, label: "Speed" },
    showOrbits: { value: true, label: "Show Orbits" },
  });

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
          color: "rgba(255,255,255,0.6)",
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
            marginBottom: "4px",
          }}
        >
          ☀ SOLAR SYSTEM
        </div>
        <div>🖱 DRAG — orbit view</div>
        <div>🖱 SCROLL — zoom</div>
        <div>🖱 HOVER planet — info</div>
      </div>

      <Canvas
        camera={{ position: [0, 28, 55], fov: 55 }}
        gl={{ antialias: true, toneMapping: 3 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene speedMultiplier={speedMultiplier} showOrbits={showOrbits} />
        </Suspense>
        <OrbitControls
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
