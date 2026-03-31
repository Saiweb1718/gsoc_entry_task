import { useState } from "react";

export default function AssetCard({ def, onDragStart, onMouseDown }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, def)}
      onMouseDown={() => onMouseDown(def)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? "#c0cfe0" : "#e4e8ed"}`,
        borderRadius: 8,
        padding: "8px 6px",
        cursor: "grab",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        userSelect: "none",
        background: hov ? "#f0f4f8" : "#fafafa",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{def.emoji}</span>
      <span style={{ fontSize: 10, color: "#666", textAlign: "center", lineHeight: 1.2 }}>
        {def.name}
      </span>
    </div>
  );
}