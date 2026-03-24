import { useEffect } from "react";

// Orbital periods in Earth days (relative)
export const ORBITAL_PERIODS = {
  Mercury: 87.97,
  Venus: 224.7,
  Earth: 365.25,
  Mars: 686.97,
  Jupiter: 4332.59,
  Saturn: 10759.22,
  Uranus: 30688.5,
  Neptune: 60182,
};

// J2000 epoch reference angles (degrees) — approximate
export const J2000_ANGLES = {
  Mercury: 252.25,
  Venus: 181.98,
  Earth: 100.46,
  Mars: 355.45,
  Jupiter: 34.4,
  Saturn: 50.08,
  Uranus: 314.06,
  Neptune: 304.35,
};

export function getAngleForDate(planetName, date) {
  const J2000 = new Date("2000-01-01T12:00:00Z");
  const daysSinceJ2000 = (date - J2000) / (1000 * 60 * 60 * 24);
  const period = ORBITAL_PERIODS[planetName];
  const baseAngle = J2000_ANGLES[planetName] * (Math.PI / 180);
  const angle = baseAngle + (2 * Math.PI * daysSinceJ2000) / period;
  return angle;
}

export default function TimeControls({
  simDate,
  setSimDate,
  simSpeed,
  setSimSpeed,
  isPlaying,
  setIsPlaying,
}) {
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimDate((d) => new Date(d.getTime() + simSpeed * 24 * 60 * 60 * 1000));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  const fmt = simDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(0,0,0,0.8)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 40,
        padding: "10px 22px",
        backdropFilter: "blur(12px)",
        fontFamily: "'Courier New', monospace",
        color: "#fff",
        boxShadow: "0 0 30px rgba(240,192,96,0.08)",
      }}
    >
      {/* Rewind to today */}
      <button
        onClick={() => setSimDate(new Date())}
        title="Jump to today"
        style={btnStyle}
      >
        ⌂
      </button>

      {/* Play/Pause */}
      <button onClick={() => setIsPlaying((p) => !p)} style={btnStyle}>
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Date display */}
      <div
        style={{
          fontSize: 13,
          letterSpacing: "0.1em",
          color: "#f0c060",
          minWidth: 140,
          textAlign: "center",
        }}
      >
        📅 {fmt}
      </div>

      {/* Speed */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span>SPEED</span>
        {[1, 7, 30, 365].map((s) => (
          <button
            key={s}
            onClick={() => setSimSpeed(s)}
            style={{
              ...btnStyle,
              background:
                simSpeed === s ? "rgba(240,192,96,0.2)" : "transparent",
              color: simSpeed === s ? "#f0c060" : "rgba(255,255,255,0.5)",
              border:
                simSpeed === s
                  ? "1px solid rgba(240,192,96,0.4)"
                  : "1px solid transparent",
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {s === 1 ? "1d" : s === 7 ? "1w" : s === 30 ? "1mo" : "1yr"}
          </button>
        ))}
      </div>

      {/* Manual date input */}
      <input
        type="date"
        value={simDate.toISOString().split("T")[0]}
        onChange={(e) => setSimDate(new Date(e.target.value))}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          borderRadius: 8,
          padding: "3px 8px",
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          cursor: "pointer",
        }}
      />
    </div>
  );
}

const btnStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
  padding: "4px 6px",
  borderRadius: 6,
  transition: "opacity 0.2s",
};
