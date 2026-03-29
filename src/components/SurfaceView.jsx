import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SURFACES } from "../data/planetSurfaces";

// Procedural terrain generator
function generateTerrain(details, featureType) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Sky gradient (not used here but kept for reference)
  const colors = details;

  if (featureType === "craters") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 1024;
      const y = 128 + Math.random() * 100;
      const r = 10 + Math.random() * 60;
      const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
      g.addColorStop(0, colors[1]);
      g.addColorStop(0.6, colors[0]);
      g.addColorStop(1, colors[2]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (featureType === "volcanic") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 60;
      const h = 40 + Math.random() * 80;
      ctx.fillStyle = colors[1];
      ctx.beginPath();
      ctx.moveTo(x - h * 0.6, 256);
      ctx.lineTo(x, y);
      ctx.lineTo(x + h * 0.6, 256);
      ctx.fill();
      // Lava glow
      const g = ctx.createRadialGradient(x, y + 20, 2, x, y + 20, 30);
      g.addColorStop(0, "#ff4400");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(x - 30, y, 60, 60);
    }
  } else if (featureType === "grass") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = 100 + Math.random() * 80;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, y, 2 + Math.random() * 4, 15 + Math.random() * 30);
    }
  } else if (featureType === "bands") {
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * 256;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, y, 1024, 256 / 12 + 2);
    }
  } else if (featureType === "ice") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 100;
      ctx.strokeStyle = "rgba(180,255,255,0.3)";
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 200, y + Math.random() * 80);
      ctx.stroke();
    }
  } else if (featureType === "rings" || featureType === "storm") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 256;
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillRect(0, y, 1024, 3 + Math.random() * 8);
    }
    ctx.globalAlpha = 1;
  }

  return canvas;
}

export default function SurfaceView({ planet, onExit }) {
  const canvasRef = useRef();
  const rendererRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const frameRef = useRef();
  const [phase, setPhase] = useState("descending"); // descending | landed | exiting
  const [showLore, setShowLore] = useState(false);

  const surface = SURFACES[planet.name];

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(
      surface.fogColor,
      10,
      surface.fogDensity > 0 ? 80 : 1000,
    );
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      85,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    camera.position.set(0, 1.7, 0); // eye height
    camera.rotation.x = -0.1;
    cameraRef.current = camera;

    // Sky sphere
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 2;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext("2d");
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, surface.skyTop);
    skyGrad.addColorStop(1, surface.skyBottom);
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 2, 512);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Atmosphere glow layer
    if (surface.atmosphereOpacity > 0) {
      const atmGeo = new THREE.SphereGeometry(480, 32, 16);
      const atmMat = new THREE.MeshBasicMaterial({
        color: surface.atmosphereColor,
        transparent: true,
        opacity: surface.atmosphereOpacity * 0.4,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmGeo, atmMat));
    }

    // Stars
    if (surface.stars) {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(3000);
      for (let i = 0; i < 1000; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 450;
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20; // upper hemisphere only
        starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      scene.add(
        new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({
            color: "#ffffff",
            size: 1.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
          }),
        ),
      );
    }

    // Sun disc
    if (surface.sunSize > 0) {
      const sunGeo = new THREE.SphereGeometry(surface.sunSize * 3, 16, 16);
      const sunMat = new THREE.MeshBasicMaterial({ color: surface.sunColor });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(60, 80, -200);
      scene.add(sun);
      // Sun glow
      const glowGeo = new THREE.SphereGeometry(surface.sunSize * 5, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: surface.sunColor,
        transparent: true,
        opacity: 0.15,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(sun.position);
      scene.add(glow);
    }

    // Saturn rings arc in sky
    if (planet.name === "Saturn") {
      const ringCurve = new THREE.EllipseCurve(
        0,
        0,
        300,
        80,
        0,
        Math.PI,
        false,
        0,
      );
      const ringPoints = ringCurve
        .getPoints(80)
        .map((p) => new THREE.Vector3(p.x, p.y + 40, -100));
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      for (let i = 0; i < 4; i++) {
        const ringLine = new THREE.Line(
          ringGeo,
          new THREE.LineBasicMaterial({
            color: "#c8b98a",
            transparent: true,
            opacity: 0.15 + i * 0.06,
          }),
        );
        ringLine.scale.y = 0.8 + i * 0.15;
        scene.add(ringLine);
      }
    }

    // Ground plane
    const terrainCanvas = generateTerrain(
      surface.groundDetails,
      surface.surfaceFeatures,
    );
    const terrainTex = new THREE.CanvasTexture(terrainCanvas);
    terrainTex.wrapS = THREE.RepeatWrapping;
    terrainTex.wrapT = THREE.RepeatWrapping;
    terrainTex.repeat.set(8, 2);
    const groundGeo = new THREE.PlaneGeometry(400, 400, 40, 40);
    // Slightly undulate the ground
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, (Math.random() - 0.5) * 1.2);
    }
    pos.needsUpdate = true;
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshLambertMaterial({
      map: terrainTex,
      color: surface.groundColor,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Lighting
    scene.add(new THREE.AmbientLight(surface.ambientLight, 0.8));
    const dirLight = new THREE.DirectionalLight(surface.sunColor, 0.6);
    dirLight.position.set(1, 2, -1);
    scene.add(dirLight);

    // Descent animation state
    let startY = 120;
    let targetY = 1.7;
    let startTime = null;
    let landedTime = null;
    let yaw = 0;

    // Animate
    const animate = (time) => {
      frameRef.current = requestAnimationFrame(animate);

      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;

      if (phase === "descending" || elapsed < 3.5) {
        // Descent
        const t = Math.min(elapsed / 3.0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        camera.position.y = startY + (targetY - startY) * eased;
        camera.rotation.x = -0.1 + 0.05 * eased;
        if (t >= 1 && !landedTime) {
          landedTime = time;
          setPhase("landed");
          setTimeout(() => setShowLore(true), 600);
        }
      } else {
        // Gentle look-around when landed
        yaw += 0.0008;
        camera.rotation.y = Math.sin(yaw) * 0.15;
      }

      renderer.render(scene, camera);
    };

    frameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Descent flash overlay */}
      {phase === "descending" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: surface.atmosphereColor,
            animation: "surfaceFlash 1.2s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <style>{`
        @keyframes surfaceFlash {
          0%   { opacity: 1; }
          40%  { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes loreIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hudIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {/* Planet name HUD */}
      {phase === "landed" && (
        <div
          style={{
            position: "absolute",
            top: 32,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Courier New', monospace",
            textAlign: "center",
            animation: "hudIn 1s ease-out forwards",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.4em",
              opacity: 0.5,
              marginBottom: 4,
            }}
          >
            SURFACE OF
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: "bold",
              letterSpacing: "0.2em",
              color: planet.color,
            }}
          >
            {planet.name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.15em",
              opacity: 0.5,
              marginTop: 4,
            }}
          >
            {surface.mood}
          </div>
        </div>
      )}

      {/* Lore text */}
      {showLore && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: 560,
            textAlign: "center",
            fontFamily: "'Courier New', monospace",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            lineHeight: 1.8,
            letterSpacing: "0.04em",
            animation: "loreIn 1.2s ease-out forwards",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          {surface.lore}
        </div>
      )}

      {/* Exit button */}
      {phase === "landed" && (
        <button
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            padding: "10px 28px",
            borderRadius: 24,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            animation: "hudIn 1.5s ease-out forwards",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.borderColor = planet.color)}
          onMouseLeave={(e) =>
            (e.target.style.borderColor = "rgba(255,255,255,0.2)")
          }
        >
          🚀 LEAVE SURFACE
        </button>
      )}

      {/* Coordinates readout */}
      {phase === "landed" && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 32,
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            lineHeight: 1.8,
            textAlign: "right",
            animation: "hudIn 2s ease-out forwards",
          }}
        >
          <div>LAT 0°00'00"N</div>
          <div>LON 0°00'00"E</div>
          <div>ALT 0.0m</div>
        </div>
      )}
    </div>
  );
}
