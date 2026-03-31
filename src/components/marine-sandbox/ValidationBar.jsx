export default function ValidationBar({ assets }) {
  const { ok, msg } = (() => {
    if (assets.length === 0) return { ok: true, msg: "No assets placed" };
    if (assets.length > 20)
      return { ok: false, msg: `${assets.length} assets — may affect AR performance` };
    return { ok: true, msg: `${assets.length} asset${assets.length === 1 ? "" : "s"} — ready to export` };
  })();

  return (
    <div
      style={{
        padding: "9px 14px",
        borderTop: "1px solid #e4e8ed",
        display: "flex",
        alignItems: "center",
        gap: 7,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: ok ? "#6db88a" : "#e07c4a",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 11, color: "#888" }}>{msg}</span>
    </div>
  );
}