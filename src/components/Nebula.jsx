import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Makes a soft circular dot texture for stars — fixes the square problem
function makeCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const CIRCLE_TEXTURE = makeCircleTexture();

// ─── Spiral Galaxy ───────────────────────────────────────────────────────────

function SpiralGalaxy({
  count = 5000,
  radius = 380,
  arms = 5,
  spin = 2.5,
  spread = 0.35,
}) {
  const ref = useRef();

  const { positions, colorArray } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);

    const coreColors = ["#ffd6a0", "#ffbb77", "#ffffff", "#fff0cc"];
    const armColors = ["#aaccff", "#ffffff", "#cceeff", "#ffccee"];
    const outerColors = ["#6688cc", "#8866aa", "#aaaacc"];

    for (let i = 0; i < count; i++) {
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const t = Math.random();
      const dist = Math.pow(t, 0.6) * radius;
      const spiralAngle = armAngle + (dist / radius) * spin * Math.PI;
      const scatter = (Math.random() - 0.5) * spread * dist * 0.7;
      const scatterAngle = spiralAngle + Math.PI / 2;

      const x = Math.cos(spiralAngle) * dist + Math.cos(scatterAngle) * scatter;
      const y = (Math.random() - 0.5) * (12 + (1 - t) * 30);
      const z = Math.sin(spiralAngle) * dist + Math.sin(scatterAngle) * scatter;

      // ── Skip stars too close to the solar system ──
      if (Math.sqrt(x * x + z * z) < 120) continue;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      let pool;
      if (dist < radius * 0.15) pool = coreColors;
      else if (dist < radius * 0.55) pool = armColors;
      else pool = outerColors;

      const c = new THREE.Color(pool[Math.floor(Math.random() * pool.length)]);
      const brightness = 0.35 + 0.65 * (1 - dist / radius);
      colorArray[i * 3] = c.r * brightness;
      colorArray[i * 3 + 1] = c.g * brightness;
      colorArray[i * 3 + 2] = c.b * brightness;
    }
    return { positions, colorArray };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    return geo;
  }, [positions, colorArray]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={1.2}
        map={CIRCLE_TEXTURE}
        sizeAttenuation
        vertexColors
        transparent
        alphaTest={0.01}
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Galactic Core — pushed FAR back, small and tight ────────────────────────

function GalacticCore() {
  const ref = useRef();

  const { positions, colorArray } = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const colors = ["#ffffff", "#fff4cc", "#ffd6a0"];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 2) * 28; // tight — max 28 units

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.18; // very flat
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = new THREE.Color(
        colors[Math.floor(Math.random() * colors.length)],
      );
      const brightness = 1 - (r / 28) * 0.5;
      colorArray[i * 3] = c.r * brightness;
      colorArray[i * 3 + 1] = c.g * brightness;
      colorArray[i * 3 + 2] = c.b * brightness;
    }
    return { positions, colorArray };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    return geo;
  }, [positions, colorArray]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.9}
        map={CIRCLE_TEXTURE}
        sizeAttenuation
        vertexColors
        transparent
        alphaTest={0.01}
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Nebula Clouds ────────────────────────────────────────────────────────────

function NebulaCloud({ count, spread, color, opacity, size, rotationSpeed }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.pow(Math.random(), 1.5) * spread;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={size}
        map={CIRCLE_TEXTURE}
        sizeAttenuation
        color={color}
        transparent
        alphaTest={0.001}
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Nebula() {
  return (
    // Tilt so spiral arms are visible from our camera angle
    <group rotation={[0.2, 0.4, 0.05]}>
      <SpiralGalaxy />

      {/* Core sits at origin of the galaxy, which is far from solar system */}
      <GalacticCore />

      {/* Nebula clouds along spiral arms */}
      <group position={[180, 30, -120]}>
        <NebulaCloud
          count={1600}
          spread={110}
          color="#00ffe0"
          opacity={0.02}
          size={2.5}
          rotationSpeed={0.001}
        />
        <NebulaCloud
          count={800}
          spread={65}
          color="#00ccff"
          opacity={0.013}
          size={3.8}
          rotationSpeed={-0.0008}
        />
      </group>

      <group position={[-200, -50, -60]}>
        <NebulaCloud
          count={1400}
          spread={120}
          color="#ff44aa"
          opacity={0.018}
          size={3.0}
          rotationSpeed={0.0007}
        />
        <NebulaCloud
          count={700}
          spread={75}
          color="#ff88cc"
          opacity={0.011}
          size={4.5}
          rotationSpeed={-0.001}
        />
      </group>

      <group position={[40, -30, -260]}>
        <NebulaCloud
          count={1800}
          spread={140}
          color="#aa44ff"
          opacity={0.016}
          size={3.2}
          rotationSpeed={0.0005}
        />
        <NebulaCloud
          count={1000}
          spread={85}
          color="#6644ff"
          opacity={0.011}
          size={5.0}
          rotationSpeed={-0.0006}
        />
      </group>

      <group position={[-120, 70, 80]}>
        <NebulaCloud
          count={1100}
          spread={85}
          color="#ff8800"
          opacity={0.015}
          size={2.8}
          rotationSpeed={0.0009}
        />
        <NebulaCloud
          count={550}
          spread={48}
          color="#ffcc44"
          opacity={0.009}
          size={4.2}
          rotationSpeed={-0.0007}
        />
      </group>

      <group position={[220, -20, 120]}>
        <NebulaCloud
          count={1300}
          spread={100}
          color="#ff2244"
          opacity={0.014}
          size={3.5}
          rotationSpeed={0.0006}
        />
        <NebulaCloud
          count={650}
          spread={55}
          color="#ff6666"
          opacity={0.009}
          size={4.8}
          rotationSpeed={-0.0005}
        />
      </group>
    </group>
  );
}
