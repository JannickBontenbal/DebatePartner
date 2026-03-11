import { STAGES, COLORS } from '../utils/constants';
import { useDebate }      from '../hooks/useDebate';
import CustomCursor       from './CustomCursor';
import Marquee            from './Marquee';
import SetupStage         from './SetupStage';
import ChooseSideStage    from './ChooseSideStage';
import DebateStage        from './DebateStage';
import ApiConfigModal     from './ApiConfigModal';
import { useEffect, useState } from 'react';

export default function DebatePartner() {
  const debate = useDebate();
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    try {
      const hasKey = window.localStorage.getItem('dp_api_key');
      const envKey = process.env.REACT_APP_FREE_LLM_API_KEY || '';
      if (!hasKey && !envKey) setShowApiModal(true);
    } catch (_) {
      setShowApiModal(true);
    }
  }, []);

  const handleSaved = () => {
    // Refresh stage state if needed; no-op otherwise
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Custom cursor ── */}
      <CustomCursor />

      {/* ── Background decoration ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -140, right: -140, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,0,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.06) 0%, transparent 70%)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div style={{ position: 'absolute', top: '20%', left: '4%',  width: 1, height: '45%', background: 'linear-gradient(to bottom, transparent, rgba(13,13,13,0.09), transparent)' }} />
        <div style={{ position: 'absolute', top: '15%', right: '6%', width: 1, height: '55%', background: 'linear-gradient(to bottom, transparent, rgba(13,13,13,0.07), transparent)' }} />
      </div>

      {/* ── Ticker ── */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <Marquee />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'relative', zIndex: 10,
        padding: '36px 48px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 5, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>
            The Arena&nbsp;/&nbsp;Issue No.{debate.round > 0 ? String(debate.round).padStart(2, '0') : '00'}
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px, 8vw, 92px)', lineHeight: 0.9, letterSpacing: 2, color: COLORS.ink }}>
            DEBATE<br />
            <span style={{ color: '#FF3B00', WebkitTextStroke: '2px #FF3B00' }}>PARTNER</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', paddingTop: 8 }}>
          <button
            onClick={() => setShowApiModal(true)}
            style={{ background: 'none', border: '1px solid #ddd', borderRadius: 14, padding: '8px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#555', cursor: 'pointer', marginBottom: 8 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF3B00'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
          >
            API Settings
          </button>
          {debate.stage !== STAGES.SETUP && (
            <button
              onClick={debate.reset}
              style={{ background: 'none', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: 12, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', transition: 'color 0.2s', display: 'block', marginBottom: 6, marginLeft: 'auto' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF3B00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; }}
            >
              {'\u2190 New Debate'}
            </button>
          )}
          <div style={{ fontFamily: "'DM Serif Display',serif", fontStyle: 'italic', fontSize: 13, color: '#bbb' }}>
            Where ideas are tested
          </div>
        </div>
      </header>

      {/* ── Divider ── */}
      <div style={{ position: 'relative', zIndex: 10, margin: '22px 48px 0', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ flex: 1, height: 3, background: COLORS.ink }} />
        <div style={{ width: 8, height: 8, background: '#FF3B00', borderRadius: '50%', animation: 'pulseDot 2s ease-in-out infinite' }} />
        <div style={{ flex: 1, height: 1, background: 'rgba(13,13,13,0.18)' }} />
      </div>

      {/* ── Main content ── */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1,
        padding: '36px 48px 0',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
      }}>
        {debate.stage === STAGES.SETUP && (
          <SetupStage
            rawTopic={debate.rawTopic}
            setRawTopic={debate.setRawTopic}
            topicDisplay={debate.topicDisplay}
            setTopicDisplay={debate.setTopicDisplay}
            setupLoading={debate.setupLoading}
            onSubmit={debate.submitTopic}
          />
        )}

        {debate.stage === STAGES.CHOOSE_SIDE && (
          <ChooseSideStage
            topicDisplay={debate.topicDisplay}
            onChoose={debate.chooseSide}
            onBack={debate.reset}
          />
        )}

        {debate.stage === STAGES.DEBATE && (
          <DebateStage
            topicDisplay={debate.topicDisplay}
            userSide={debate.userSide}
            aiSide={debate.aiSide}
            round={debate.round}
            messages={debate.messages}
            input={debate.input}
            setInput={debate.setInput}
            loading={debate.loading}
            hasVerdict={debate.hasVerdict}
            onSend={debate.sendArgument}
            onVerdict={debate.requestVerdict}
            onReset={debate.reset}
            onRegenerateVerdict={debate.regenerateVerdict}
            onRegenerateAi={debate.regenerateAiMessage}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        margin: '40px 48px 0',
        borderTop: '2px solid #0D0D0D',
        padding: '18px 0',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#bbb', letterSpacing: 2, textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        <span>Debate Partner © 2026</span>
        <span>Made by Jannick Bontenbal</span>
      </footer>

      <ApiConfigModal
        open={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSaved={handleSaved}
      />

    </div>
  );
}
