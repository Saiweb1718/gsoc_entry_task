import { useState, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const ORGANISMS = [
  { id: "clownfish", name: "Clownfish",  emoji: "🐠", type: "organism" },
  { id: "turtle",    name: "Sea Turtle", emoji: "🐢", type: "organism" },
  { id: "shark",     name: "Shark",      emoji: "🦈", type: "organism" },
  { id: "octopus",   name: "Octopus",    emoji: "🐙", type: "organism" },
  { id: "dolphin",   name: "Dolphin",    emoji: "🐬", type: "organism" },
  { id: "crab",      name: "Crab",       emoji: "🦀", type: "organism" },
  { id: "jellyfish", name: "Jellyfish",  emoji: "🪼", type: "organism" },
  { id: "whale",     name: "Whale",      emoji: "🐋", type: "organism" },
];

const EMOJI_MAP = ORGANISMS.reduce((m, a) => { m[a.id] = a.emoji; return m; }, {});

const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23e0e6ee' stroke-width='1'/%3E%3C/svg%3E")`;

let _nextId = 1;
const uid = () => "asset_" + (_nextId++);

const makeAsset = (def, x, y) => ({
  uid: uid(),
  assetId: def.id,
  type: def.type,
  label: def.name,
  emoji: def.emoji,
  x: Math.round(x),
  y: Math.round(y),
  scale: 1,
});

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const show = useCallback((m) => {
    setMsg(m);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2000);
  }, []);
  return { msg, visible, show };
}

function useAssets() {
  const [assets, setAssets] = useState([]);
  const add    = useCallback((a) => setAssets(p => [...p, a]), []);
  const remove = useCallback((id) => setAssets(p => p.filter(a => a.uid !== id)), []);
  const update = useCallback((id, patch) => setAssets(p => p.map(a => a.uid === id ? { ...a, ...patch } : a)), []);
  const clear  = useCallback(() => setAssets([]), []);
  const set    = useCallback((list) => setAssets(list), []);
  return { assets, add, remove, update, clear, set };
}

// ── JSON helpers ──────────────────────────────────────────────────────────────
function buildJSON(moduleName, assets, canvasEl) {
  return {
    schema: "marine-ar-module@1.0",
    meta: {
      id: moduleName,
      name: moduleName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      created: new Date().toISOString(),
      canvas: {
        width: canvasEl?.offsetWidth || 800,
        height: canvasEl?.offsetHeight || 500,
        coordinateSystem: "top-left",
      },
    },
    assets: assets.map(a => ({
      uid: a.uid,
      assetId: a.assetId,
      type: a.type,
      label: a.label,
      transform: { x: a.x, y: a.y, scale: a.scale },
    })),
    validation: {
      assetCount: assets.length,
      hasOrganisms: assets.some(a => a.type === "organism"),
    },
  };
}

function restoreAssets(data) {
  return (data.assets || []).map(a => ({
    uid: a.uid || uid(),
    assetId: a.assetId,
    type: a.type,
    label: a.label,
    emoji: EMOJI_MAP[a.assetId] || "🐟",
    x: a.transform?.x || 200,
    y: a.transform?.y || 200,
    scale: a.transform?.scale || 1,
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AssetCard({ def, onDragStart, onMouseDown }) {
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
        borderRadius: 8, padding: "8px 6px", cursor: "grab",
        transition: "all 0.15s", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4, userSelect: "none",
        background: hov ? "#f0f4f8" : "#fafafa",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{def.emoji}</span>
      <span style={{ fontSize: 10, color: "#666", textAlign: "center", lineHeight: 1.2 }}>{def.name}</span>
    </div>
  );
}

function PlacedAsset({ data, selected, canvasRef, snap, onSelect, onRemove, onUpdate }) {
  const dragStart = useRef(null);
  const isDragging = useRef(false);
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = (e) => {
    if (e.target.dataset.role === "delete") return;
    if (e.target.dataset.role === "scale") { startScale(e); return; }
    e.stopPropagation(); e.preventDefault();
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
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX, s0 = data.scale;
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
        position: "absolute", left: data.x, top: data.y,
        transform: "translate(-50%, -50%)",
        zIndex: 3, cursor: "move", userSelect: "none",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        padding: "4px 6px", borderRadius: 8, position: "relative",
        border: selected ? "1.5px solid #5b8de0" : "1.5px solid transparent",
        background: selected ? "rgba(91,141,224,0.08)" : "transparent",
      }}>
        {selected && (
          <button
            data-role="delete"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{
              position: "absolute", top: -8, right: -8,
              width: 18, height: 18, borderRadius: "50%",
              background: "#e05a4a", color: "#fff", border: "none",
              fontSize: 12, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 10, padding: 0,
            }}
          >×</button>
        )}
        <span style={{ fontSize: Math.round(32 * data.scale), display: "block", lineHeight: 1 }}>
          {data.emoji}
        </span>
        {selected && (
          <div
            data-role="scale"
            onMouseDown={startScale}
            style={{
              position: "absolute", bottom: -8, right: -8,
              width: 12, height: 12, borderRadius: "50%",
              background: "#5b8de0", cursor: "se-resize",
            }}
          />
        )}
      </div>
      {(hovered || selected) && (
        <span style={{
          marginTop: 2, fontSize: 10, color: "#555",
          background: "rgba(255,255,255,0.9)", padding: "1px 5px",
          borderRadius: 4, whiteSpace: "nowrap", pointerEvents: "none",
          border: "1px solid #e4e8ed",
        }}>{data.label}</span>
      )}
    </div>
  );
}

function PropsPanel({ asset, onUpdate }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{asset.emoji}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{asset.label}</div>
          <span style={{
            display: "inline-block", fontSize: 10, padding: "1px 7px",
            borderRadius: 20, border: "1px solid #b8ddd0",
            background: "#eaf4f0", color: "#2d7a5c", marginTop: 2,
          }}>organism</span>
        </div>
      </div>

      <FieldLabel>Display name</FieldLabel>
      <input
        style={INPUT}
        value={asset.label}
        onChange={e => onUpdate({ label: e.target.value })}
      />

      <FieldLabel>Position</FieldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div>
          <span style={{ fontSize: 10, color: "#bbb", display: "block", marginBottom: 2 }}>X</span>
          <input style={INPUT} type="number" value={asset.x}
            onChange={e => onUpdate({ x: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <span style={{ fontSize: 10, color: "#bbb", display: "block", marginBottom: 2 }}>Y</span>
          <input style={INPUT} type="number" value={asset.y}
            onChange={e => onUpdate({ y: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <FieldLabel>Scale — <span style={{ color: "#5b8de0" }}>{asset.scale}×</span></FieldLabel>
      <input
        style={{ width: "100%", accentColor: "#4a7fd4", cursor: "pointer" }}
        type="range" min={0.3} max={4} step={0.1} value={asset.scale}
        onChange={e => onUpdate({ scale: parseFloat(e.target.value) })}
      />
    </div>
  );
}

function JSONPanel({ json, onCopy, onDownload }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 12, gap: 8, overflow: "hidden" }}>
      <pre style={{
        flex: 1, overflowY: "auto", margin: 0,
        background: "#f5f7fa", border: "1px solid #e4e8ed", borderRadius: 6,
        padding: 10, fontSize: 10.5, lineHeight: 1.6, color: "#444",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: "pre",
      }}>{json}</pre>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn onClick={onCopy} style={{ flex: 1 }}>Copy</Btn>
        <Btn onClick={onDownload} variant="primary" style={{ flex: 1 }}>Download</Btn>
      </div>
    </div>
  );
}

function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState("");
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 12, padding: 24, width: 460,
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: "#1a1d23" }}>Import Module</h2>
        <textarea
          style={{
            width: "100%", height: 180, border: "1px solid #e4e8ed", borderRadius: 8,
            padding: 12, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
            resize: "none", outline: "none", marginBottom: 12, color: "#333",
            background: "#f9fafc", boxSizing: "border-box",
          }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste marine-ar-module JSON here…"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn onClick={onClose} variant="ghost">Cancel</Btn>
          <Btn onClick={() => onImport(text)} variant="primary">Import</Btn>
        </div>
      </div>
    </div>
  );
}

function ValidationBar({ assets }) {
  const { ok, msg } = (() => {
    if (assets.length === 0) return { ok: true, msg: "No assets placed" };
    if (assets.length > 20) return { ok: false, msg: `${assets.length} assets — may affect AR performance` };
    return { ok: true, msg: `${assets.length} asset${assets.length === 1 ? "" : "s"} — ready to export` };
  })();
  return (
    <div style={{ padding: "9px 14px", borderTop: "1px solid #e4e8ed", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "#6db88a" : "#e07c4a", flexShrink: 0, display: "inline-block" }} />
      <span style={{ fontSize: 11, color: "#888" }}>{msg}</span>
    </div>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────
const INPUT = {
  width: "100%", border: "1px solid #e4e8ed", borderRadius: 6,
  padding: "6px 9px", fontSize: 12, fontFamily: "inherit",
  background: "#f9fafc", color: "#1a1d23", outline: "none", boxSizing: "border-box",
};

function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, color: "#888", marginBottom: 4, marginTop: 12, fontWeight: 500 }}>{children}</div>;
}

function Btn({ children, onClick, variant = "default", style: st }) {
  const [hov, setHov] = useState(false);
  const variants = {
    default: { base: { background: "#f5f7fa", border: "1px solid #e4e8ed", color: "#444" }, hover: { background: "#edf0f5" } },
    ghost:   { base: { background: "transparent", border: "1px solid transparent", color: "#444" }, hover: { background: "#f0f3f7" } },
    primary: { base: { background: "#4a7fd4", border: "1px solid #3a6fc4", color: "#fff" }, hover: { background: "#3a6fc4" } },
  };
  const v = variants[variant];
  return (
    <button
      style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", ...v.base, ...(hov ? v.hover : {}), ...st }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { assets, add, remove, update, clear, set } = useAssets();
  const [selected, setSelected] = useState(null);
  const [moduleName, setModuleName] = useState("reef_scene_01");
  const [showGrid, setShowGrid] = useState(true);
  const [snapGrid, setSnapGrid] = useState(false);
  const [activeTab, setActiveTab] = useState("props");
  const [importOpen, setImportOpen] = useState(false);
  const canvasRef = useRef(null);
  const paletteDrag = useRef(null);
  const toast = useToast();

  const selectedAsset = assets.find(a => a.uid === selected) || null;
  const snap = useCallback((v) => snapGrid ? Math.round(v / 40) * 40 : v, [snapGrid]);

  // ── Placement ──
  const placeAsset = useCallback((def, x, y) => {
    const a = makeAsset(def, x, y);
    add(a);
    setSelected(a.uid);
    setActiveTab("props");
    toast.show(`Added ${def.name}`);
  }, [add, toast]);

  // ── Drag from palette ──
  const handlePaletteDragStart = (e, def) => {
    paletteDrag.current = def;
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!paletteDrag.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    placeAsset(paletteDrag.current, snap(e.clientX - rect.left), snap(e.clientY - rect.top));
    paletteDrag.current = null;
  };

  // ── Quick add ──
  const addRandom = () => {
    const def = ORGANISMS[Math.floor(Math.random() * ORGANISMS.length)];
    const c = canvasRef.current;
    placeAsset(def, snap(80 + Math.random() * (c.offsetWidth - 160)), snap(60 + Math.random() * (c.offsetHeight - 120)));
  };

  // ── Clear ──
  const clearScene = () => {
    if (assets.length === 0) return;
    if (!confirm("Clear all assets?")) return;
    clear(); setSelected(null); toast.show("Scene cleared");
  };

  // ── JSON ──
  const getJSON = () => JSON.stringify(buildJSON(moduleName, assets, canvasRef.current), null, 2);

  const exportJSON = () => {
    if (assets.length === 0) { toast.show("No assets to export"); return; }
    const blob = new Blob([getJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = (moduleName || "module") + ".json";
    a.click(); URL.revokeObjectURL(url);
    toast.show("Exported");
  };

  const copyJSON = () => { navigator.clipboard.writeText(getJSON()); toast.show("Copied"); };

  // ── Import ──
  const doImport = (text) => {
    try {
      const data = JSON.parse(text.trim());
      if (!data.schema?.startsWith("marine-ar-module")) throw new Error("Invalid schema");
      if (data.meta?.id) setModuleName(data.meta.id);
      set(restoreAssets(data));
      setSelected(null);
      setImportOpen(false);
      toast.show(`Imported ${data.assets?.length || 0} assets`);
    } catch (e) { toast.show("Invalid JSON: " + e.message); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f5f7fa", color: "#1a1d23", overflow: "hidden" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, background: "#fff", borderBottom: "1px solid #e4e8ed", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌊</span>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Marine Sandbox</span>
          <span style={{ color: "#ccd0d6", fontSize: 16, margin: "0 2px" }}>/</span>
          <input
            style={{ border: "1px solid #e4e8ed", background: "#f5f7fa", padding: "4px 10px", borderRadius: 6, fontSize: 13, color: "#1a1d23", fontFamily: "inherit", outline: "none", width: 180 }}
            value={moduleName}
            onChange={e => setModuleName(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Btn onClick={() => setImportOpen(true)}>Import</Btn>
          <Btn onClick={clearScene} variant="ghost">Clear</Btn>
          <Btn onClick={exportJSON} variant="primary">Export JSON</Btn>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Palette sidebar */}
        <aside style={{ width: 200, flexShrink: 0, background: "#fff", borderRight: "1px solid #e4e8ed", overflowY: "auto" }}>
          <div style={{ padding: "12px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6, marginTop: 4, paddingLeft: 2 }}>Organisms</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {ORGANISMS.map(def => (
                <AssetCard
                  key={def.id}
                  def={def}
                  onDragStart={handlePaletteDragStart}
                  onMouseDown={() => { paletteDrag.current = def; }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e4e8ed", flexShrink: 0 }}>
            <ToolBtn active={showGrid} onClick={() => setShowGrid(v => !v)} title="Grid">⊞</ToolBtn>
            <ToolBtn active={snapGrid} onClick={() => { setSnapGrid(v => !v); toast.show(snapGrid ? "Snap off" : "Snap on"); }} title="Snap">◫</ToolBtn>
            <div style={{ width: 1, height: 18, background: "#e4e8ed", margin: "0 4px" }} />
            <button style={{ padding: "4px 12px", border: "1px solid #e4e8ed", borderRadius: 6, background: "#f5f7fa", fontSize: 12, cursor: "pointer", color: "#444", fontFamily: "inherit" }} onClick={addRandom}>+ Quick Add</button>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#aaa" }}>{assets.length} asset{assets.length !== 1 ? "s" : ""}</span>
          </div>

          <div
            ref={canvasRef}
            style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f0f4f8", backgroundImage: showGrid ? GRID_BG : "none", backgroundSize: "40px 40px", cursor: "default" }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleCanvasDrop}
            onClick={e => { if (e.target === canvasRef.current) setSelected(null); }}
          >
            {assets.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none", opacity: 0.45 }}>
                <span style={{ fontSize: 36 }}>🌊</span>
                <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>Drag organisms here or use Quick Add</p>
              </div>
            )}
            {assets.map(a => (
              <PlacedAsset
                key={a.uid}
                data={a}
                selected={selected === a.uid}
                canvasRef={canvasRef}
                snap={snap}
                onSelect={() => { setSelected(a.uid); setActiveTab("props"); }}
                onRemove={() => remove(a.uid)}
                onUpdate={patch => update(a.uid, patch)}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <aside style={{ width: 260, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e4e8ed", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e4e8ed" }}>
            {["props", "json"].map(t => (
              <button key={t}
                style={{ flex: 1, padding: "12px 8px", fontSize: 12, fontWeight: 500, background: "none", border: "none", borderBottom: activeTab === t ? "2px solid #4a7fd4" : "2px solid transparent", cursor: "pointer", color: activeTab === t ? "#1a1d23" : "#888", fontFamily: "inherit" }}
                onClick={() => setActiveTab(t)}>
                {t === "props" ? "Properties" : "JSON"}
              </button>
            ))}
          </div>

          {activeTab === "props" && (
            selectedAsset
              ? <PropsPanel asset={selectedAsset} onUpdate={patch => update(selected, patch)} />
              : <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 28, opacity: 0.3 }}>◎</span>
                  <p style={{ fontSize: 12, color: "#aaa" }}>Select an asset to edit</p>
                </div>
          )}

          {activeTab === "json" && (
            <JSONPanel json={getJSON()} onCopy={copyJSON} onDownload={exportJSON} />
          )}

          <ValidationBar assets={assets} />
        </aside>
      </div>

      {toast.visible && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1d23", color: "#fff", padding: "9px 18px", borderRadius: 8, fontSize: 12, zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", pointerEvents: "none" }}>
          {toast.msg}
        </div>
      )}

      {importOpen && <ImportModal onImport={doImport} onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function ToolBtn({ children, active, onClick, title }) {
  return (
    <button title={title} onClick={onClick} style={{ width: 28, height: 28, border: `1px solid ${active ? "#c0cfe0" : "transparent"}`, borderRadius: 6, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", background: active ? "#e8edf4" : "transparent", color: active ? "#3a6ab0" : "#888" }}>
      {children}
    </button>
  );
}