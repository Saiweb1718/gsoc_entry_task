import { useState } from "react";

export default function Btn({ children, onClick, variant = "default", style: st = {} }) {
  const [hov, setHov] = useState(false);

  const variants = {
    default: { base: { background: "#f5f7fa", border: "1px solid #e4e8ed", color: "#444" }, hover: { background: "#edf0f5" } },
    ghost:   { base: { background: "transparent", border: "1px solid transparent", color: "#444" }, hover: { background: "#f0f3f7" } },
    primary: { base: { background: "#4a7fd4", border: "1px solid #3a6fc4", color: "#fff" }, hover: { background: "#3a6fc4" } },
  };

  const v = variants[variant];

  return (
    <button
      style={{
        padding: "6px 14px",
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        ...v.base,
        ...(hov ? v.hover : {}),
        ...st,
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}