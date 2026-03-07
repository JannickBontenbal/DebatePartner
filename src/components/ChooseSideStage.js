import { useState } from 'react';
import { COLORS } from '../utils/constants';

export default function ChooseSideStage({ topicDisplay, onChoose, onBack }) {
  const [hovered, setHovered] = useState(null);

  const cards = [
    {
      side: 'FOR',
      hoverBg:    '#2ECC71',
      hoverColor: '#0D0D0D',
      hoverShadow:'rgba(46,204,113,0.35)',
      tagline: 'I believe this motion is true.',
      cta: 'ARGUE IN FAVOUR →',
    },
    {
      side: 'AGAINST',
      hoverBg:    '#FF3B00',
      hoverColor: '#fff',
      hoverShadow:'rgba(255,59,0,0.35)',
      tagline: 'I reject this motion entirely.',
      cta: 'ARGUE AGAINST →',
    },
  ];

  return (
    <div className="scale-in">
      {/* Motion display */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 5, color: '#aaa', textTransform: 'uppercase', marginBottom: 14 }}>
          Tonight's Motion
        </div>
        <div style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: 'clamp(20px, 3.5vw, 42px)',
          lineHeight: 1.2,
          color: COLORS.ink,
          maxWidth: 680,
          position: 'relative',
          paddingLeft: 24,
        }}>
          <span style={{ position: 'absolute', left: 0, top: 4, width: 5, bottom: 4, background: '#FF3B00' }} />
          "{topicDisplay}"
        </div>
      </div>

      {/* Divider label */}
      <div style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 12,
        letterSpacing: 3,
        color: '#aaa',
        textTransform: 'uppercase',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span>Choose your side</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(13,13,13,0.15)' }} />
        <span>The AI argues the opposite</span>
      </div>

      {/* Side cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'stretch' }}>
        {cards.map(({ side, hoverBg, hoverColor, hoverShadow, tagline, cta }, idx) => {
          const isHovered = hovered === side;
          return (
            <button
              key={side}
              onClick={() => onChoose(side)}
              onMouseEnter={() => setHovered(side)}
              onMouseLeave={() => setHovered(null)}
              style={{
                border: '3px solid #0D0D0D',
                padding: '44px 36px',
                textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                background: isHovered ? hoverBg : (idx === 0 ? '#0D0D0D' : COLORS.cream),
                color:      isHovered ? hoverColor : (idx === 0 ? '#F5F0E8' : '#0D0D0D'),
                boxShadow:  isHovered ? `12px 12px 0 ${hoverShadow}` : '8px 8px 0 rgba(0,0,0,0.12)',
                transform:  isHovered ? 'translateY(-6px)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 0.9, letterSpacing: 2, marginBottom: 20 }}>
                {side}
              </div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontStyle: 'italic', fontSize: 17, marginBottom: 14, opacity: 0.8 }}>
                {tagline}
              </div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, opacity: 0.55, letterSpacing: 1.5 }}>
                {cta}
              </div>
            </button>
          );
        })}

        {/* VS divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 1, flex: 1, background: 'rgba(13,13,13,0.15)' }} />
          <div style={{
            width: 52, height: 52,
            border: '3px solid #0D0D0D',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
            background: COLORS.cream,
            flexShrink: 0,
          }}>
            VS
          </div>
          <div style={{ width: 1, flex: 1, background: 'rgba(13,13,13,0.15)' }} />
        </div>
      </div>

      <button
        onClick={onBack}
        style={{ marginTop: 28, background: 'none', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', transition: 'color 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF3B00'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#bbb'; }}
      >
        ← Change Topic
      </button>
    </div>
  );
}
