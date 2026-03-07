import { useState, useEffect } from 'react';

/**
 * Tracks mouse position for a custom cursor dot.
 * Returns { x, y } in pixels.
 */
export function useCursor() {
  const [pos, setPos] = useState({ x: -20, y: -20 });

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return pos;
}
