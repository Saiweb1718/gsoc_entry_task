import FieldLabel from "../../shared/FieldLabel.jsx";

const INPUT = {
  width: "100%",
  border: "1px solid #e4e8ed",
  borderRadius: 6,
  padding: "6px 9px",
  fontSize: 12,
  fontFamily: "inherit",
  background: "#f9fafc",
  color: "#1a1d23",
  outline: "none",
  boxSizing: "border-box",
};

export default function PropsPanel({ asset, onUpdate }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{asset.emoji}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{asset.label}</div>
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              padding: "1px 7px",
              borderRadius: 20,
              border: "1px solid #b8ddd0",
              background: "#eaf4f0",
              color: "#2d7a5c",
              marginTop: 2,
            }}
          >
            organism
          </span>
        </div>
      </div>

      <FieldLabel>Display name</FieldLabel>
      <input
        style={INPUT}
        value={asset.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
      />

      <FieldLabel>Position</FieldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div>
          <span style={{ fontSize: 10, color: "#bbb", display: "block", marginBottom: 2 }}>X</span>
          <input
            style={INPUT}
            type="number"
            value={asset.x}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <span style={{ fontSize: 10, color: "#bbb", display: "block", marginBottom: 2 }}>Y</span>
          <input
            style={INPUT}
            type="number"
            value={asset.y}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <FieldLabel>
        Scale — <span style={{ color: "#5b8de0" }}>{asset.scale}×</span>
      </FieldLabel>
      <input
        style={{ width: "100%", accentColor: "#4a7fd4", cursor: "pointer" }}
        type="range"
        min={0.3}
        max={4}
        step={0.1}
        value={asset.scale}
        onChange={(e) => onUpdate({ scale: parseFloat(e.target.value) })}
      />
    </div>
  );
}