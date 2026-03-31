export default function ToolBtn({ children, active, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        border: `1px solid ${active ? "#c0cfe0" : "transparent"}`,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        background: active ? "#e8edf4" : "transparent",
        color: active ? "#3a6ab0" : "#888",
      }}
    >
      {children}
    </button>
  );
}