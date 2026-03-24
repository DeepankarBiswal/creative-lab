import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COMET_DURATION = 6; // seconds per pass

function randomLaunchParams() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 80;
  const startX = Math.cos(angle) * radius;
  const startZ = Math.sin(angle) * radius;
  const startY = (Math.random() - 0.5) * 30;
  // aim roughly toward center with some offset
  const endX = (Math.random() - 0.5) * 20;
  const endZ = (Math.random() - 0.5) * 20;
  const endY = (Math.random() - 0.5) * 10;
  return {
    start: new THREE.Vector3(startX, startY, startZ),
    end: new THREE.Vector3(endX, endY, endZ),
  };
}

export default function Comet({ onPass }) {
  const headRef = useRef();
  const tailRef = useRef();
  const timeRef = useRef(Math.random() * 10); // stagger first appearance
  const params = useRef(randomLaunchParams());
  const active = useRef(false);
  const [visible, setVisible] = useState(false);

  const TAIL_COUNT = 60;

  const tailPositions = useMemo(() => new Float32Array(TAIL_COUNT * 3), []);
  const tailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(tailPositions, 3));
    return geo;
  }, [tailPositions]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // spawn every 4–7 seconds
    if (!active.current && timeRef.current > 4 + Math.random() * 3) {
      active.current = true;
      timeRef.current = 0;
      params.current = randomLaunchParams();
      setVisible(true);
      onPass?.();
    }

    if (!active.current) return;

    const t = Math.min(timeRef.current / COMET_DURATION, 1);
    const pos = new THREE.Vector3().lerpVectors(
      params.current.start,
      params.current.end,
      t,
    );

    if (headRef.current) headRef.current.position.copy(pos);

    // Build tail trailing behind
    for (let i = 0; i < TAIL_COUNT; i++) {
      const tt = Math.max(0, t - (i / TAIL_COUNT) * 0.3);
      const tp = new THREE.Vector3().lerpVectors(
        params.current.start,
        params.current.end,
        tt,
      );
      tailPositions[i * 3] = tp.x;
      tailPositions[i * 3 + 1] = tp.y;
      tailPositions[i * 3 + 2] = tp.z;
    }
    tailGeo.attributes.position.needsUpdate = true;

    if (t >= 1) {
      active.current = false;
      timeRef.current = 0;
      setVisible(false);
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Head */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Glow */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.15} />
      </mesh>
      {/* Tail */}
      <points geometry={tailGeo}>
        <pointsMaterial
          color="#aaddff"
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.6}
          vertexColors={false}
        />
      </points>
    </group>
  );
}
