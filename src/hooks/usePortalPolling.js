import { useEffect, useRef } from 'react';

/** Poll a refresh callback for real-time dashboard sync (no WebSocket). */
export function usePortalPolling(callback, intervalMs = 20000, enabled = true) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => {
      saved.current?.();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
}
