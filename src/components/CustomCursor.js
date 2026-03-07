import { useCursor } from '../hooks/useCursor';

export default function CustomCursor() {
  const { x, y } = useCursor();
  return (
    <>
      {/* Orange dot */}
      <div style={{
        position: 'fixed',
        left:  x - 5,
        top:   y - 5,
        width:  10,
        height: 10,
        borderRadius: '50%',
        background: '#FF3B00',
        pointerEvents: 'none',
        zIndex: 99999,
        mixBlendMode: 'multiply',
        transition: 'transform 0.08s',
      }} />
      {/* Outer ring */}
      <div style={{
        position: 'fixed',
        left:  x - 20,
        top:   y - 20,
        width:  40,
        height: 40,
        borderRadius: '50%',
        border: '1.5px solid rgba(13,13,13,0.25)',
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'left 0.12s, top 0.12s',
      }} />
    </>
  );
}
