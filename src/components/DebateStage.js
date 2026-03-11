import { useRef, useEffect } from 'react';
import { SIDE_CONFIG, COLORS } from '../utils/constants';

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 44, height: 44,
        background: COLORS.cream,
        border: `3px solid ${SIDE_CONFIG.AGAINST.color}`,
        boxShadow: `3px 3px 0 ${SIDE_CONFIG.AGAINST.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 13,
      }}>AI</div>
      <div style={{
        background: COLORS.white,
        border: `3px solid ${SIDE_CONFIG.AGAINST.color}`,
        padding: '18px 24px',
        boxShadow: `5px 5px 0 ${SIDE_CONFIG.AGAINST.color}33`,
      }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: SIDE_CONFIG.AGAINST.color,
              animation: `pulseDot 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#bbb', marginLeft: 8, letterSpacing: 2 }}>
            COMPOSING ARGUMENT
          </span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, userSide, aiSide, onRegenerate }) {
  const isJudge = msg.role === 'judge';
  const isUser = msg.role === 'user';
  const cfg = SIDE_CONFIG[msg.side];
  const avatarBg = isUser ? '#0D0D0D' : COLORS.cream;
  const avatarColor = isUser ? '#F5F0E8' : '#0D0D0D';
  const bubbleBg = isJudge ? '#FFFBEA' : isUser ? '#0D0D0D' : COLORS.white;
  const bubbleText = isJudge ? '#333' : isUser ? '#F5F0E8' : '#0D0D0D';
  const borderColor = isJudge ? '#FFD700' : isUser ? '#0D0D0D' : cfg.color;
  const shadow = isJudge ? '6px 6px 0 rgba(255,215,0,0.28)' : isUser ? '5px 5px 0 rgba(13,13,13,0.14)' : `5px 5px 0 ${cfg.color}33`;

  return (
    <div
      className={isUser ? 'msg-right' : 'msg-left'}
      style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 14, alignItems: 'flex-start' }}
    >
      <div style={{
        flexShrink: 0, width: 44, height: 44,
        background: avatarBg,
        border: `3px solid ${borderColor}`,
        boxShadow: `3px 3px 0 ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: avatarColor, letterSpacing: 1,
      }}>
        {isUser ? 'YOU' : isJudge ? 'JUDGE' : 'AI'}
      </div>

      <div style={{
        maxWidth: '70%',
        background: bubbleBg,
        border: `3px solid ${borderColor}`,
        padding: '18px 22px',
        boxShadow: shadow,
      }}>
        <div style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 3,
          color: borderColor, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
        }}>
          {isJudge ? "Judge's Verdict" : isUser ? `You - ${msg.side}` : `Opposition - ${msg.side}`}
        </div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: bubbleText, lineHeight: 1.78 }}>
          {msg.text}
        </div>
        {!isUser && onRegenerate && (
          <button
            onClick={onRegenerate}
            style={{
              marginTop: 10,
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isJudge ? '#FFFBEA' : '#fff',
              border: `1px solid ${borderColor}`,
              color: '#0D0D0D',
              borderRadius: '50%',
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: isJudge ? '3px 3px 0 rgba(255,215,0,0.2)' : `3px 3px 0 ${cfg.color}33`,
            }}
            title="Regenerate"
            aria-label="Regenerate"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}

export default function DebateStage({
  topicDisplay, userSide, aiSide, round,
  messages, input, setInput, loading, hasVerdict,
  onSend, onVerdict, onReset, onRegenerateVerdict, onRegenerateAi,
}) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 28, flexWrap: 'wrap', gap: 14,
      }}>
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 4, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>
            Motion
          </div>
          <div style={{
            fontFamily: "'DM Serif Display',serif", fontStyle: 'italic',
            fontSize: 'clamp(13px, 2.2vw, 20px)', color: COLORS.ink, maxWidth: 480, lineHeight: 1.35,
          }}>
            "{topicDisplay}"
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, border: '3px solid #0D0D0D', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            padding: '10px 22px',
            background: userSide === 'FOR' ? '#2ECC71' : '#0D0D0D',
            color:      userSide === 'FOR' ? '#0D0D0D' : '#F5F0E8',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 3,
            borderRight: '2px solid #0D0D0D',
          }}>
            YOU - {userSide}
          </div>
          <div style={{
            padding: '10px 18px',
            background: COLORS.cream,
            display: 'flex', alignItems: 'center',
            fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#aaa', letterSpacing: 2,
            borderRight: '2px solid #0D0D0D',
          }}>
            RD {String(round).padStart(2, '0')}
          </div>
          <div style={{
            padding: '10px 22px',
            background: aiSide === 'AGAINST' ? '#FF3B00' : '#2ECC71',
            color: '#fff',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 3,
          }}>
            AI - {aiSide}
          </div>
        </div>
      </div>

      <div style={{
        maxHeight: '50vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 18,
        marginBottom: 18, paddingRight: 4,
      }}>
        {messages.map((msg, i) => {
          const regenHandler =
            msg.role === 'judge'
              ? onRegenerateVerdict
              : msg.role === 'ai'
              ? () => onRegenerateAi(i)
              : undefined;
          return (
            <MessageBubble
              key={i}
              msg={msg}
              userSide={userSide}
              aiSide={aiSide}
              onRegenerate={regenHandler}
            />
          );
        })}
        {loading && !hasVerdict && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {!hasVerdict ? (
        <div style={{ border: '3px solid #0D0D0D', background: COLORS.white, boxShadow: '6px 6px 0 #0D0D0D', overflow: 'hidden' }}>
          <div style={{
            background: '#0D0D0D', padding: '9px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 3,
              color: userSide === 'FOR' ? '#2ECC71' : '#FF3B00',
            }}>
              YOUR ARGUMENT - {userSide}
            </span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#666', letterSpacing: 1 }}>
              ↵ Enter to send
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="Make your case..."
            rows={4}
            disabled={loading}
            style={{
              width: '100%', border: 'none', padding: '18px 22px',
              fontSize: 16, resize: 'none', background: COLORS.white, color: COLORS.ink,
              lineHeight: 1.7, opacity: loading ? 0.5 : 1,
              fontFamily: "'DM Serif Display',serif",
            }}
          />

          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            padding: '12px 14px', background: '#F9F7F2', borderTop: '2px solid #0D0D0D',
          }}>
            <button
              onClick={onVerdict}
              disabled={loading || messages.length < 4}
              style={{
                background: messages.length >= 4 && !loading ? '#FFFBEA' : '#eee',
                color:      messages.length >= 4 && !loading ? '#0D0D0D' : '#ccc',
                border:     `2px solid ${messages.length >= 4 && !loading ? '#FFD700' : '#ddd'}`,
                padding: '11px 20px',
                fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (messages.length >= 4 && !loading) { e.currentTarget.style.background = '#FFD700'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = messages.length >= 4 && !loading ? '#FFFBEA' : '#eee'; }}
            >
              ⚖ Verdict
            </button>

            <button
              onClick={onSend}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#0D0D0D' : '#ddd',
                color:      input.trim() && !loading ? '#F5F0E8' : '#aaa',
                border: 'none',
                padding: '11px 30px',
                fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => { if (input.trim() && !loading) { e.currentTarget.style.background = '#FF3B00'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = input.trim() ? '#0D0D0D' : '#ddd'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? 'Waiting...' : 'Fire →'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onReset}
          style={{
            width: '100%', background: COLORS.cream,
            border: '3px solid #0D0D0D', color: COLORS.ink,
            padding: '22px', fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 22, letterSpacing: 5, transition: 'all 0.25s',
            boxShadow: '6px 6px 0 #0D0D0D',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0D0D0D'; e.currentTarget.style.color = '#F5F0E8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.cream; e.currentTarget.style.color = COLORS.ink; }}
        >
          START A NEW DEBATE →
        </button>
      )}
    </div>
  );
}



