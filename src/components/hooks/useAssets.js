import { useState, useCallback } from "react";

export function useAssets() {
  const [assets, setAssets] = useState([]);

  const add    = useCallback((a) => setAssets(p => [...p, a]), []);
  const remove = useCallback((id) => setAssets(p => p.filter(a => a.uid !== id)), []);
  const update = useCallback((id, patch) => setAssets(p => p.map(a => a.uid === id ? { ...a, ...patch } : a)), []);
  const clear  = useCallback(() => setAssets([]), []);
  const set    = useCallback((list) => setAssets(list), []);

  return { assets, add, remove, update, clear, set };
}