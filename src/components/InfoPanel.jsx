export default function InfoPanel({ planet, onClose }) {
  if (!planet) return null;
  const { name, color, description, facts } = planet;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "300px",
        background: "rgba(0,0,0,0.88)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
        zIndex: 100,
        fontFamily: "'Courier New', monospace",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fact-row { display: flex; justify-content: space-between; padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; }
        .fact-label { color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; }
        .fact-value { color: #fff; font-weight: bold; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 14,
            lineHeight: "26px",
            textAlign: "center",
          }}
        >
          ✕
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
          <div
            style={{ fontSize: 22, fontWeight: "bold", letterSpacing: "0.2em" }}
          >
            {name.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "3px 10px",
            border: `1px solid ${color}`,
            borderRadius: 20,
            fontSize: 10,
            color: color,
            letterSpacing: "0.1em",
          }}
        >
          {facts.type}
        </div>
      </div>

      {/* Facts */}
      <div style={{ padding: "8px 24px", flex: 1, overflowY: "auto" }}>
        {[
          ["Diameter", facts.diameter],
          ["Mass", facts.mass],
          ["Day Length", facts.dayLength],
          ["Year Length", facts.yearLength],
          ["Moons", facts.moons],
          ["Temperature", facts.temp],
        ].map(([label, value]) => (
          <div className="fact-row" key={label}>
            <span className="fact-label">{label}</span>
            <span className="fact-value">{value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.05em",
        }}
      >
        CLICK ELSEWHERE IN SPACE TO DISMISS
      </div>
    </div>
  );
}
