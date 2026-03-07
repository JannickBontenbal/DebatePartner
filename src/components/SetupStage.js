import { useRef } from 'react';
import { QUICK_TOPICS, COLORS } from '../utils/constants';
import { extractFileText } from '../utils/fileExtract';

export default function SetupStage({
  rawTopic, setRawTopic, topicDisplay, setTopicDisplay,
  setupLoading, onSubmit,
}) {
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await extractFileText(file);
      setRawTopic(text.slice(0, 4000));
      setTopicDisplay(`📄 ${file.name}`);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  }

  const textareaVal = topicDisplay.startsWith('📄') ? '' : rawTopic;

  return (
    <div>
      <div className="fade-up" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 60,
        alignItems: 'start',
      }}>

        {/* ── Left: editorial copy ── */}
        <div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(26px, 4vw, 50px)',
            lineHeight: 1.15,
            color: COLORS.ink,
            marginBottom: 28,
          }}>
            Every great<br />
            <em style={{ color: COLORS.orange }}>argument</em> starts<br />
            with a topic.
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: '#777',
            lineHeight: 1.75,
            maxWidth: 360,
          }}>
            Describe your debate subject, paste an article, or upload a document.
            Our AI will take the opposing side and challenge every point you make.
          </p>

          {/* Floating badge */}
          <div style={{
            marginTop: 44,
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'float 6s ease-in-out infinite',
          }}>
            <div style={{
              width: 104,
              height: 104,
              border: '3px solid #0D0D0D',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: COLORS.cream,
              position: 'relative',
            }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, lineHeight: 1 }}>VS</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: '#888', textTransform: 'uppercase' }}>YOU / AI</span>
              <div style={{
                position: 'absolute',
                inset: -10,
                border: '1px dashed rgba(13,13,13,0.2)',
                borderRadius: '50%',
                animation: 'spin 20s linear infinite',
              }} />
            </div>
          </div>
        </div>

        {/* ── Right: input card ── */}
        <div className="fade-up-d1">
          <div style={{
            background: COLORS.white,
            border: '3px solid #0D0D0D',
            boxShadow: '8px 8px 0 #0D0D0D',
            overflow: 'hidden',
          }}>
            {/* Card title bar */}
            <div style={{
              background: '#0D0D0D',
              padding: '13px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 3, color: '#F5F0E8' }}>
                SET THE MOTION
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF3B00', '#FFD700', '#2ECC71'].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
            </div>

            <textarea
              value={textareaVal}
              onChange={(e) => { setRawTopic(e.target.value); setTopicDisplay(e.target.value); }}
              placeholder={'e.g. "Universal basic income does more harm than good"\n— or paste any article...'}
              rows={7}
              style={{
                width: '100%',
                border: 'none',
                padding: '22px 24px',
                fontSize: 16,
                lineHeight: 1.7,
                resize: 'none',
                background: COLORS.white,
                color: COLORS.ink,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {topicDisplay.startsWith('📄') && (
              <div style={{ padding: '0 24px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: COLORS.green, fontWeight: 500 }}>
                {topicDisplay}
              </div>
            )}

            <div style={{
              padding: '14px 18px',
              borderTop: '2px solid #0D0D0D',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F9F7F2',
            }}>
              <button
                onClick={() => fileRef.current.click()}
                style={{
                  background: COLORS.cream,
                  border: '2px solid #0D0D0D',
                  color: COLORS.ink,
                  padding: '10px 18px',
                  fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0D0D0D'; e.currentTarget.style.color = '#F5F0E8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.cream; e.currentTarget.style.color = COLORS.ink; }}
              >
                📎 Upload
              </button>
              <input ref={fileRef} type="file" accept=".txt,.md,.docx" onChange={handleFile} style={{ display: 'none' }} />

              <button
                onClick={onSubmit}
                disabled={!rawTopic.trim() || setupLoading}
                style={{
                  background: rawTopic.trim() && !setupLoading ? '#0D0D0D' : '#ddd',
                  color:      rawTopic.trim() && !setupLoading ? '#F5F0E8' : '#aaa',
                  border: 'none',
                  padding: '12px 28px',
                  fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => { if (rawTopic.trim()) { e.currentTarget.style.background = '#FF3B00'; e.currentTarget.style.boxShadow = '0 0 0 5px rgba(255,59,0,0.15)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = rawTopic.trim() ? '#0D0D0D' : '#ddd'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {setupLoading ? 'Thinking…' : 'Enter the Arena →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-topic pills */}
      <div className="fade-up-d3" style={{ marginTop: 52, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {QUICK_TOPICS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              const t = `Is ${tag} more of a benefit or harm to society?`;
              setRawTopic(t);
              setTopicDisplay(t);
            }}
            style={{
              background: 'none',
              border: '1.5px solid rgba(13,13,13,0.22)',
              color: '#777',
              padding: '8px 18px',
              borderRadius: 20,
              fontSize: 12,
              fontFamily: "'DM Sans',sans-serif",
              letterSpacing: 2,
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0D0D0D'; e.currentTarget.style.color = '#F5F0E8'; e.currentTarget.style.borderColor = '#0D0D0D'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#777'; e.currentTarget.style.borderColor = 'rgba(13,13,13,0.22)'; }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
