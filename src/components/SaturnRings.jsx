import { useMemo } from "react";
import * as THREE from "three";

export default function SaturnRings() {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(1.4, 2.4, 64);
    // Fix UV mapping so texture looks right
    const pos = geo.attributes.position;
    const v3 = new THREE.Vector3();
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      uv.setXY(i, v3.length() < 1.9 ? 0 : 1, 1);
    }
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2.5, 0, 0]}>
      <meshBasicMaterial
        color="#c8b98a"
        side={THREE.DoubleSide}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}
