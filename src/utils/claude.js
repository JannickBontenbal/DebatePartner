const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';
const FREE_LLM_API_URL = 'https://apifreellm.com/api/v1/chat';
const FREE_LLM_MODEL = 'gpt-4o-mini';
const NETLIFY_PROXY_URL = '/.netlify/functions/ai';

/**
 * Sends a request to FreeLLM (preferred), OpenAI, or Anthropic based on env key presence.
 * Supports REACT_APP_FREE_LLM_API_KEY, REACT_APP_OPENAI_API_KEY, or REACT_APP_ANTHROPIC_API_KEY in .env.
 *
 * @param {object} opts
 * @param {string}   opts.system   - System prompt
 * @param {object[]} opts.messages - Message array [{role, content}]
 * @param {number}  [opts.maxTokens=400]
 * @returns {Promise<string>} - The assistant's text response
 */
export async function callClaude({ system, messages, maxTokens = 400 }) {
  const proxyEnabled = process.env.REACT_APP_DISABLE_PROXY !== 'true';
  const freeLlmKey = process.env.REACT_APP_FREE_LLM_API_KEY;
  const openRouterKey = process.env.REACT_APP_OPENROUTER_API_KEY;
  const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const anthropicKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  const freeLlmUrl = process.env.REACT_APP_FREE_LLM_API_URL || FREE_LLM_API_URL;

  if (proxyEnabled) {
    const proxyRes = await fetch(NETLIFY_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages, maxTokens }),
    });

    if (proxyRes.ok) {
      const proxyData = await proxyRes.json().catch(() => ({}));
      const text = proxyData?.text || '';
      if (!text) throw new Error('AI returned an empty response.');
      return text;
    }

    // Local `npm start` usually has no Netlify function route; allow direct-provider fallback.
    if (proxyRes.status !== 404) {
      const err = await proxyRes.json().catch(() => ({}));
      throw new Error(err?.error || err?.message || `Proxy error ${proxyRes.status}`);
    }
  }

  if (freeLlmKey) {
    const freeLlmMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages,
    ];

    const res = await fetch(freeLlmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freeLlmKey}`,
      },
      body: JSON.stringify({
        model: FREE_LLM_MODEL,
        messages: freeLlmMessages,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ||
      data?.message?.content ||
      data?.response ||
      data?.text ||
      ''
    );
  }

  if (openRouterKey) {
    const openRouterMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages,
    ];

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: openRouterMessages,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  if (openAiKey) {
    const openAiMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages,
    ];

    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openAiMessages,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  if (anthropicKey) {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return (data.content || []).map((b) => b.text || '').join('');
  }

  throw new Error(
    'Missing API key. Set Netlify function env vars, or set REACT_APP_FREE_LLM_API_KEY / REACT_APP_OPENROUTER_API_KEY / REACT_APP_OPENAI_API_KEY / REACT_APP_ANTHROPIC_API_KEY for direct mode.',
  );
}
