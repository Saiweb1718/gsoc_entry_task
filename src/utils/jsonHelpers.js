import { EMOJI_MAP } from '../constants/marineOrganisms.js';

let _nextId = 1;
export const uid = () => "asset_" + (_nextId++);

export const makeAsset = (def, x, y) => ({
  uid: uid(),
  assetId: def.id,
  type: def.type,
  label: def.name,
  emoji: def.emoji,
  x: Math.round(x),
  y: Math.round(y),
  scale: 1,
});

export const buildJSON = (moduleName, assets, canvasEl) => ({
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
});

export const restoreAssets = (data) => {
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
};