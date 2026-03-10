const FREE_LLM_API_URL = 'https://apifreellm.com/api/v1/chat';
const LOCAL_PROXY_URL = '/api/dev-llm';
const PROD_PROXY_URL = process.env.REACT_APP_AI_PROXY_URL || '/api/ai.php';

function getUserConfig() {
  if (typeof window === 'undefined') return {};
  try {
    const apiKey = window.localStorage.getItem('dp_api_key') || '';
    const apiUrl = window.localStorage.getItem('dp_api_url') || '';
    return { apiKey, apiUrl };
  } catch (_) {
    return {};
  }
}

function buildPrompt(system, messages) {
  const lines = [];
  if (system) lines.push(`System:\n${system}`);
  for (const msg of messages || []) {
    const role = msg?.role || 'user';
    const content = msg?.content || '';
    lines.push(`${role}:\n${content}`);
  }
  return lines.join('\n\n');
}

/**
 * Sends a request via backend proxy first, then falls back to direct provider mode for local development.
 * Supports REACT_APP_AI_PROXY_URL and REACT_APP_FREE_LLM_API_KEY in .env.
 *
 * @param {object} opts
 * @param {string}   opts.system   - System prompt
 * @param {object[]} opts.messages - Message array [{role, content}]
 * @param {number}  [opts.maxTokens=400]
 * @returns {Promise<string>} - The assistant's text response
 */
export async function callClaude({ system, messages, maxTokens = 400 }) {
  const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const proxyEnabled = isLocalhost
    ? true
    : process.env.REACT_APP_DISABLE_PROXY !== 'true';
  const { apiKey: storedKey, apiUrl: storedUrl } = getUserConfig();
  const freeLlmKey = storedKey || process.env.REACT_APP_FREE_LLM_API_KEY;
  const freeLlmUrl = storedUrl || process.env.REACT_APP_FREE_LLM_API_URL || FREE_LLM_API_URL;
  const prompt = buildPrompt(system, messages);

  if (proxyEnabled) {
    const proxyUrl = isLocalhost ? LOCAL_PROXY_URL : PROD_PROXY_URL;
    try {
      const proxyRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages,
          maxTokens,
          apiKey: storedKey,
          apiUrl: storedUrl,
        }),
      });

      if (proxyRes.ok) {
        const contentType = proxyRes.headers.get('content-type') || '';
        if (contentType.toLowerCase().includes('application/json')) {
          const proxyData = await proxyRes.json().catch(() => ({}));
          const text = proxyData?.text || '';
          if (text) return text;
        }
        if (!isLocalhost) throw new Error('AI returned an empty response.');
      } else {
        // Local `npm start` usually has no backend proxy route; allow direct-provider fallback.
        if (proxyRes.status !== 404 || !isLocalhost) {
          const err = await proxyRes.json().catch(() => ({}));
          throw new Error(err?.error || err?.message || `Proxy error ${proxyRes.status}`);
        }
      }
    } catch (err) {
      if (!isLocalhost) throw err;
    }

  }

  if (freeLlmKey) {
    const res = await fetch(freeLlmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freeLlmKey}`,
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.response || data?.text || '';
  }

  throw new Error(
    'Missing API key. Set backend FREE_LLM_API_KEY or set REACT_APP_FREE_LLM_API_KEY for direct mode.',
  );
}
