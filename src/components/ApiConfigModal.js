import { useEffect, useState } from 'react';

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: 24,
};

const modalCard = {
  width: '100%',
  maxWidth: 520,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 22px 45px rgba(0,0,0,0.18)',
  padding: '24px 24px 20px',
  fontFamily: "'DM Sans', sans-serif",
  color: '#111',
};

const labelStyle = { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#777', marginBottom: 6 };
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 14,
  marginBottom: 12,
};

export default function ApiConfigModal({ open, onClose, onSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://apifreellm.com/api/v1/chat');
  const [status, setStatus] = useState(null); // plain text status
  const [result, setResult] = useState(null); // { ok: boolean, message: string }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const storedKey = window.localStorage.getItem('dp_api_key');
      const storedUrl = window.localStorage.getItem('dp_api_url');
      if (storedKey) setApiKey(storedKey);
      if (storedUrl) setApiUrl(storedUrl);
    } catch (_) {
      /* ignore */
    }
  }, [open]);

  const saveLocally = (key, url) => {
    try {
      window.localStorage.setItem('dp_api_key', key);
      window.localStorage.setItem('dp_api_url', url);
    } catch (_) {
      /* ignore */
    }
  };

  const testEndpoint = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/dev-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'healthcheck',
          messages: [{ role: 'user', content: 'ping' }],
          maxTokens: 5,
          apiKey,
          apiUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = data?.text || '';
      return text.trim().length > 0;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setStatus(null);
    setResult(null);
    try {
      if (!apiKey.trim()) {
        setStatus('Please provide an API key.');
        return;
      }
      setLoading(true);
      const ok = await testEndpoint();
      if (!ok) {
        setStatus('Could not verify the endpoint; please check the key or URL.');
        return;
      }
      saveLocally(apiKey.trim(), apiUrl.trim());
      setResult({ ok: true, message: 'Saved and verified. You are good to go!' });
      onSaved?.({ apiKey: apiKey.trim(), apiUrl: apiUrl.trim() });
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Connect your AI</div>
        <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
          Enter an API key and endpoint. We’ll verify once before saving locally. Stored values override .env.
        </div>

        <div style={labelStyle}>API URL</div>
        <input
          style={inputStyle}
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://apifreellm.com/api/v1/chat"
        />

        <div style={labelStyle}>API Key</div>
        <input
          style={inputStyle}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="apf_..."
        />

        {status && (
          <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 10 }}>
            {status}
          </div>
        )}
        {result && (
          <div
            style={{
              fontSize: 13,
              color: result.ok ? '#0a8f3c' : '#c0392b',
              background: result.ok ? 'rgba(10,143,60,0.08)' : 'rgba(192,57,43,0.08)',
              border: `1px solid ${result.ok ? '#0a8f3c' : '#c0392b'}`,
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 10,
            }}
          >
            {result.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
          >
            Exit
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: loading ? '#aaa' : '#111',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking…' : 'Save & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}
