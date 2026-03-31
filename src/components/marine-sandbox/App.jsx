import { useState, useRef, useCallback } from "react";

import { ORGANISMS, GRID_BG } from "../../constants/marineOrganisms.js";
import { makeAsset, buildJSON, restoreAssets } from "../../utils/jsonHelpers.js";

import { useToast } from "./hooks/useToast.js";
import { useAssets } from "./hooks/useAssets.js";

import AssetCard from "./AssetCard.jsx";
import PlacedAsset from "./PlacedAsset.jsx";
import PropsPanel from "./PropsPanel.jsx";
import JSONPanel from "./JSONPanel.jsx";
import ImportModal from "./ImportModal.jsx";
import ValidationBar from "./ValidationBar.jsx";
import ToolBtn from "./ToolBtn.jsx";
import Btn from "../shared/Btn.jsx";
import FieldLabel from "../shared/FieldLabel.jsx";

export default function App() {
  const { assets, add, remove, update, clear, set } = useAssets();
  const [selected, setSelected] = useState(null);
  const [moduleName, setModuleName] = useState("example");
  const [showGrid, setShowGrid] = useState(true);
  const [snapGrid, setSnapGrid] = useState(false);
  const [activeTab, setActiveTab] = useState("props");
  const [importOpen, setImportOpen] = useState(false);

  const canvasRef = useRef(null);
  const paletteDrag = useRef(null);
  const toast = useToast();

  const selectedAsset = assets.find((a) => a.uid === selected) || null;
  const snap = useCallback((v) => (snapGrid ? Math.round(v / 40) * 40 : v), [snapGrid]);

  // Placement
  const placeAsset = useCallback(
    (def, x, y) => {
      const a = makeAsset(def, x, y);
      add(a);
      setSelected(a.uid);
      setActiveTab("props");
      toast.show(`Added ${def.name}`);
    },
    [add, toast]
  );

  // Drag from palette
  const handlePaletteDragStart = (e, def) => {
    paletteDrag.current = def;
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!paletteDrag.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    placeAsset(
      paletteDrag.current,
      snap(e.clientX - rect.left),
      snap(e.clientY - rect.top)
    );
    paletteDrag.current = null;
  };

  // Quick add
  const addRandom = () => {
    const def = ORGANISMS[Math.floor(Math.random() * ORGANISMS.length)];
    const c = canvasRef.current;
    placeAsset(
      def,
      snap(80 + Math.random() * (c.offsetWidth - 160)),
      snap(60 + Math.random() * (c.offsetHeight - 120))
    );
  };

  // Clear scene
  const clearScene = () => {
    if (assets.length === 0) return;
    if (!confirm("Clear all assets?")) return;
    clear();
    setSelected(null);
    toast.show("Scene cleared");
  };

  // JSON
  const getJSON = () => JSON.stringify(buildJSON(moduleName, assets, canvasRef.current), null, 2);

  const exportJSON = () => {
    if (assets.length === 0) {
      toast.show("No assets to export");
      return;
    }
    const blob = new Blob([getJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (moduleName || "module") + ".json";
    a.click();
    URL.revokeObjectURL(url);
    toast.show("Exported");
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(getJSON());
    toast.show("Copied");
  };

  // Import
  const doImport = (text) => {
    try {
      const data = JSON.parse(text.trim());
      if (!data.schema?.startsWith("marine-ar-module")) throw new Error("Invalid schema");
      if (data.meta?.id) setModuleName(data.meta.id);
      set(restoreAssets(data));
      setSelected(null);
      setImportOpen(false);
      toast.show(`Imported ${data.assets?.length || 0} assets`);
    } catch (e) {
      toast.show("Invalid JSON: " + e.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#f5f7fa",
        color: "#1a1d23",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 52,
          background: "#fff",
          borderBottom: "1px solid #e4e8ed",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
            Web sandbox
          </span>
          <span style={{ color: "#ccd0d6", fontSize: 16, margin: "0 2px" }}>/</span>
          <input
            style={{
              border: "1px solid #e4e8ed",
              background: "#f5f7fa",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 13,
              color: "#1a1d23",
              fontFamily: "inherit",
              outline: "none",
              width: 180,
            }}
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Btn onClick={() => setImportOpen(true)}>Import</Btn>
          <Btn onClick={clearScene} variant="ghost">
            Clear
          </Btn>
          <Btn onClick={exportJSON} variant="primary">
            Export JSON
          </Btn>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Palette Sidebar */}
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #e4e8ed",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "12px 10px" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#999",
                marginBottom: 6,
                marginTop: 4,
                paddingLeft: 2,
              }}
            >
              Organisms
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {ORGANISMS.map((def) => (
                <AssetCard
                  key={def.id}
                  def={def}
                  onDragStart={handlePaletteDragStart}
                  onMouseDown={() => {
                    paletteDrag.current = def;
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "#fff",
              borderBottom: "1px solid #e4e8ed",
              flexShrink: 0,
            }}
          >
            <ToolBtn
              active={showGrid}
              onClick={() => setShowGrid((v) => !v)}
              title="Grid"
            >
              ⊞
            </ToolBtn>
            <ToolBtn
              active={snapGrid}
              onClick={() => {
                setSnapGrid((v) => !v);
                toast.show(snapGrid ? "Snap off" : "Snap on");
              }}
              title="Snap"
            >
              ◫
            </ToolBtn>
            <div style={{ width: 1, height: 18, background: "#e4e8ed", margin: "0 4px" }} />
            <button
              style={{
                padding: "4px 12px",
                border: "1px solid #e4e8ed",
                borderRadius: 6,
                background: "#f5f7fa",
                fontSize: 12,
                cursor: "pointer",
                color: "#444",
                fontFamily: "inherit",
              }}
              onClick={addRandom}
            >
              + Quick Add
            </button>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#aaa" }}>
              {assets.length} asset{assets.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            ref={canvasRef}
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              background: "#f0f4f8",
              backgroundImage: showGrid ? GRID_BG : "none",
              backgroundSize: "40px 40px",
              cursor: "default",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
            onClick={(e) => {
              if (e.target === canvasRef.current) setSelected(null);
            }}
          >
            {assets.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                  opacity: 0.45,
                }}
              >
                <span style={{ fontSize: 36 }}>🌊</span>
                <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
                  Drag organisms here or use Quick Add
                </p>
              </div>
            )}

            {assets.map((a) => (
              <PlacedAsset
                key={a.uid}
                data={a}
                selected={selected === a.uid}
                canvasRef={canvasRef}
                snap={snap}
                onSelect={() => {
                  setSelected(a.uid);
                  setActiveTab("props");
                }}
                onRemove={() => remove(a.uid)}
                onUpdate={(patch) => update(a.uid, patch)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <aside
          style={{
            width: 260,
            flexShrink: 0,
            background: "#fff",
            borderLeft: "1px solid #e4e8ed",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", borderBottom: "1px solid #e4e8ed" }}>
            {["props", "json"].map((t) => (
              <button
                key={t}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === t ? "2px solid #4a7fd4" : "2px solid transparent",
                  cursor: "pointer",
                  color: activeTab === t ? "#1a1d23" : "#888",
                  fontFamily: "inherit",
                }}
                onClick={() => setActiveTab(t)}
              >
                {t === "props" ? "Properties" : "JSON"}
              </button>
            ))}
          </div>

          {activeTab === "props" &&
            (selectedAsset ? (
              <PropsPanel asset={selectedAsset} onUpdate={(patch) => update(selected, patch)} />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28, opacity: 0.3 }}>◎</span>
                <p style={{ fontSize: 12, color: "#aaa" }}>Select an asset to edit</p>
              </div>
            ))}

          {activeTab === "json" && (
            <JSONPanel json={getJSON()} onCopy={copyJSON} onDownload={exportJSON} />
          )}

          <ValidationBar assets={assets} />
        </aside>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1d23",
            color: "#fff",
            padding: "9px 18px",
            borderRadius: 8,
            fontSize: 12,
            zIndex: 1000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Import Modal */}
      {importOpen && <ImportModal onImport={doImport} onClose={() => setImportOpen(false)} />}
    </div>
  );
}