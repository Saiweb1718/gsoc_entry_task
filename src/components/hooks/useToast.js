import { useState, useRef, useCallback } from "react";

export function useToast() {
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