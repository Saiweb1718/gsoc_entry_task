import Btn from "../../shared/Btn.jsx";
import { useState } from "react";
export default function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: 460,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: "#1a1d23" }}>
          Import Module
        </h2>
        <textarea
          style={{
            width: "100%",
            height: 180,
            border: "1px solid #e4e8ed",
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            resize: "none",
            outline: "none",
            marginBottom: 12,
            color: "#333",
            background: "#f9fafc",
            boxSizing: "border-box",
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste marine-ar-module JSON here…"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn onClick={onClose} variant="ghost">
            Cancel
          </Btn>
          <Btn onClick={() => onImport(text)} variant="primary">
            Import
          </Btn>
        </div>
      </div>
    </div>
  );
}