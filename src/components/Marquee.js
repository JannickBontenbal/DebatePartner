const WORDS = [
  'DEBATE PARTNER', 'ARGUE YOUR CASE', 'CHALLENGE EVERY IDEA',
  'SHARPEN YOUR MIND', 'DEFEND YOUR POSITION', 'THINK ON YOUR FEET',
];

const repeated = [...WORDS, ...WORDS, ...WORDS, ...WORDS];

export default function Marquee() {
  return (
    <div style={{
      background: '#0D0D0D',
      color: '#F5F0E8',
      overflow: 'hidden',
      height: 36,
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        animation: 'marquee 28s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {repeated.map((t, i) => (
          <span key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 14,
            letterSpacing: 4,
            marginRight: 56,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
          }}>
            {t}
            <span style={{ color: '#FF3B00', fontSize: 16 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
