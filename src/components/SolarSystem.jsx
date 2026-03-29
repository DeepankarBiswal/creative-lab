import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useControls, Leva } from "leva";
import { Suspense, useState, useRef } from "react";
import * as THREE from "three";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import AsteroidBelt from "./AsteroidBelt";
import Nebula from "./Nebula";
import Comet from "./Comet";
import InfoPanel from "./InfoPanel";
import SurfaceView from "./SurfaceView";
import TimeControls from "./TimeControls";
import HUD from "./HUD";
import AudioManager from "./AudioManager";
import { playWhoosh, playClick } from "./AudioManager";
import { PLANETS } from "../data/planets";

function CameraController({ target, onArrived, controlsRef }) {
  const { camera } = useThree();
  const animating = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  if (target) {
    animating.current = true;
    // Offset camera to the side and slightly above the planet
    targetPos.current.set(
      target.x + target.offset,
      target.y + target.offset * 0.4,
      target.z + target.offset,
    );
    lookAt.current.set(target.x, target.y, target.z);
  }

  useFrame(() => {
    if (!animating.current || !target) return;
    camera.position.lerp(targetPos.current, 0.05);
    // Also smoothly move orbit controls target toward the planet
    if (controlsRef?.current) {
      controlsRef.current.target.lerp(lookAt.current, 0.05);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(targetPos.current) < 0.4) {
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
  simDate,
  useRealPositions,
  onCometPass,
  controlsRef,
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight
        position={[0, 0, 0]}
        intensity={8}
        color="#fff5c0"
        distance={300}
        decay={1.0}
      />
      // Add this right below your pointLight
      <pointLight
        position={[0, 0, 0]}
        intensity={1.5}
        color="#334466"
        distance={300}
        decay={1.0}
      />
      <Nebula />
      <Stars
        // radius={300}
        // depth={50}
        // count={4000}
        // factor={3}
        // saturation={0}
        // fade
        // speed={0.5}
      />
      <Sun />
      <AsteroidBelt />
      <Comet onPass={onCometPass} />
      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} distance={p.distance} />
      ))}
      {PLANETS.map((p) => (
        <Planet
          key={p.name}
          {...p}
          speedMultiplier={speedMultiplier}
          simDate={simDate}
          useRealPositions={useRealPositions}
          onSelect={(worldPos) => onPlanetSelect(p, worldPos)}
        />
      ))}
      <CameraController
        target={cameraTarget}
        onArrived={onCameraArrived}
        controlsRef={controlsRef}
      />
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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [simDate, setSimDate] = useState(new Date());
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useRealPositions, setUseRealPositions] = useState(false);
  const [landingPlanet, setLandingPlanet] = useState(null);
  const controlsRef = useRef();
  const BASE = import.meta.env.BASE_URL;

  const { speedMultiplier } = useControls("Solar System", {
    speedMultiplier: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Orbit Speed",
      render: () => !useRealPositions,
    },
  });

  const handlePlanetSelect = (planet, worldPos) => {
    playClick(BASE);
    setSelectedPlanet(planet);

    // Use actual world position instead of a guessed angle
    setCameraTarget({
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
      offset: planet.size * 6 + 3,
    });
    if (controlsRef.current) controlsRef.current.enabled = false;
  };

  const handleClose = () => {
    setSelectedPlanet(null);
    setCameraTarget(null);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
      // Reset look target back to solar system center
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 1);
      controlsRef.current.update();
    }
  };

  const handleCometPass = () => {
    playWhoosh(BASE);
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

      <AudioManager enabled={audioEnabled} />
      <HUD
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled((a) => !a)}
      />
      <InfoPanel
        planet={selectedPlanet}
        onClose={handleClose}
        onLand={() => {
          setLandingPlanet(selectedPlanet);
          setSelectedPlanet(null);
        }}
      />

      {/* Real positions toggle */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 280,
          zIndex: 10,
          fontFamily: "'Courier New', monospace",
        }}
      >
        <button
          onClick={() => setUseRealPositions((r) => !r)}
          style={{
            background: useRealPositions
              ? "rgba(240,192,96,0.15)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${useRealPositions ? "rgba(240,192,96,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: useRealPositions ? "#f0c060" : "rgba(255,255,255,0.4)",
            borderRadius: 20,
            padding: "6px 16px",
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          {useRealPositions ? "🌍 REAL POSITIONS ON" : "🌍 REAL POSITIONS OFF"}
        </button>
      </div>

      <TimeControls
        simDate={simDate}
        setSimDate={setSimDate}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />

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
            simDate={simDate}
            useRealPositions={useRealPositions}
            onCometPass={handleCometPass}
            controlsRef={controlsRef}
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
      {landingPlanet && (
        <SurfaceView
          planet={landingPlanet}
          onExit={() => setLandingPlanet(null)}
        />
      )}
    </div>
  );
}
