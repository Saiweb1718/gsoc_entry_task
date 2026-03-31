import Btn from "../../shared/Btn.jsx";

export default function JSONPanel({ json, onCopy, onDownload }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 12, gap: 8, overflow: "hidden" }}>
      <pre
        style={{
          flex: 1,
          overflowY: "auto",
          margin: 0,
          background: "#f5f7fa",
          border: "1px solid #e4e8ed",
          borderRadius: 6,
          padding: 10,
          fontSize: 10.5,
          lineHeight: 1.6,
          color: "#444",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          whiteSpace: "pre",
        }}
      >
        {json}
      </pre>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn onClick={onCopy} style={{ flex: 1 }}>
          Copy
        </Btn>
        <Btn onClick={onDownload} variant="primary" style={{ flex: 1 }}>
          Download
        </Btn>
      </div>
    </div>
  );
}