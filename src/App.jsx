import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  MeshDistortMaterial,
  Float,
  MeshWobbleMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Glitch,
  Scanline,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";

function Scene() {
  return (
    <>
      <color attach="background" args={["#020202"]} />

      {/* Cinematic Lighting: High contrast, like an Elliot Alderson flashback */}
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={2}
        color="#00ffcc"
      />
      <pointLight position={[-10, -10, -10]} intensity={5} color="#ff0055" />

      <Float speed={2} rotationIntensity={2} floatIntensity={1}>
        <mesh scale={1.2}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <MeshWobbleMaterial
            color="#111"
            factor={1}
            speed={2}
            roughness={0.1}
            metalness={1}
            emissive="#00ffcc"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* --- The "Cyber-Thriller" Stack --- */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={1.2} />

        {/* The Glitch effect: Set mode to CONSTANT_MILD for a subtle flicker */}
        <Glitch
          delay={[1.5, 3.5]} // time between glitches
          duration={[0.6, 1.0]} // how long it lasts
          strength={[0.3, 0.5]} // how distorted it gets
          mode={GlitchMode.SPORADIC}
          active
        />

        {/* Scanlines: To give it that CRT monitor feel from Mr. Robot */}
        <Scanline opacity={0.1} density={1.5} />

        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.5} />
      </EffectComposer>

      <OrbitControls enableZoom={false} />
    </>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
