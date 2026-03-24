export default function HUD({ audioEnabled, onToggleAudio }) {
  return (
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
      <div style={{ marginTop: 12 }}>
        <button
          onClick={onToggleAudio}
          style={{
            background: audioEnabled
              ? "rgba(240,192,96,0.15)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${audioEnabled ? "rgba(240,192,96,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: audioEnabled ? "#f0c060" : "rgba(255,255,255,0.4)",
            borderRadius: 20,
            padding: "4px 14px",
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            cursor: "pointer",
            letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}
        >
          {audioEnabled ? "🔊 AUDIO ON" : "🔇 AUDIO OFF"}
        </button>
      </div>
    </div>
  );
}
