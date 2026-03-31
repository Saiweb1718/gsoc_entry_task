import { useRef, useState } from "react";

export default function PlacedAsset({
  data,
  selected,
  canvasRef,
  snap,
  onSelect,
  onRemove,
  onUpdate,
}) {
  const dragStart = useRef(null);
  const isDragging = useRef(false);
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = (e) => {
    if (e.target.dataset.role === "delete") return;
    if (e.target.dataset.role === "scale") {
      startScale(e);
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    dragStart.current = { cx: e.clientX, cy: e.clientY, ox: data.x, oy: data.y };
    isDragging.current = false;

    const onMove = (e2) => {
      const dx = e2.clientX - dragStart.current.cx;
      const dy = e2.clientY - dragStart.current.cy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.current = true;
      if (!isDragging.current) return;

      const c = canvasRef.current;
      const nx = Math.max(20, Math.min(c.offsetWidth - 20, snap(dragStart.current.ox + dx)));
      const ny = Math.max(20, Math.min(c.offsetHeight - 20, snap(dragStart.current.oy + dy)));

      onUpdate({ x: Math.round(nx), y: Math.round(ny) });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startScale = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const s0 = data.scale;

    const onMove = (e2) => {
      const ns = Math.max(0.3, Math.min(4, s0 + (e2.clientX - startX) * 0.01));
      onUpdate({ scale: Math.round(ns * 10) / 10 });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: data.x,
        top: data.y,
        transform: "translate(-50%, -50%)",
        zIndex: 3,
        cursor: "move",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          padding: "4px 6px",
          borderRadius: 8,
          position: "relative",
          border: selected ? "1.5px solid #5b8de0" : "1.5px solid transparent",
          background: selected ? "rgba(91,141,224,0.08)" : "transparent",
        }}
      >
        {selected && (
          <button
            data-role="delete"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#e05a4a",
              color: "#fff",
              border: "none",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              padding: 0,
            }}
          >
            ×
          </button>
        )}

        <span
          style={{
            fontSize: Math.round(32 * data.scale),
            display: "block",
            lineHeight: 1,
          }}
        >
          {data.emoji}
        </span>

        {selected && (
          <div
            data-role="scale"
            onMouseDown={startScale}
            style={{
              position: "absolute",
              bottom: -8,
              right: -8,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#5b8de0",
              cursor: "se-resize",
            }}
          />
        )}
      </div>

      {(hovered || selected) && (
        <span
          style={{
            marginTop: 2,
            fontSize: 10,
            color: "#555",
            background: "rgba(255,255,255,0.9)",
            padding: "1px 5px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            border: "1px solid #e4e8ed",
          }}
        >
          {data.label}
        </span>
      )}
    </div>
  );
}