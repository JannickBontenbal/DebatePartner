const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const FREE_LLM_API_URL = process.env.FREE_LLM_API_URL || 'https://apifreellm.com/api/v1/chat';
const FREE_LLM_MODEL = process.env.FREE_LLM_MODEL || 'gpt-4o-mini';

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { system = '', messages = [], maxTokens = 400 } = JSON.parse(event.body || '{}');

    const freeLlmKey = process.env.FREE_LLM_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (freeLlmKey) {
      const upstream = await fetch(FREE_LLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freeLlmKey}`,
        },
        body: JSON.stringify({
          model: FREE_LLM_MODEL,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...messages,
          ],
          max_tokens: maxTokens,
        }),
      });

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return json(upstream.status, { error: data?.error?.message || data?.message || 'FreeLLM request failed' });
      }

      const text =
        data?.choices?.[0]?.message?.content ||
        data?.message?.content ||
        data?.response ||
        data?.text ||
        '';
      return json(200, { text });
    }

    if (openRouterKey) {
      const upstream = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...messages,
          ],
          max_tokens: maxTokens,
        }),
      });

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return json(upstream.status, { error: data?.error?.message || 'OpenRouter request failed' });
      }

      return json(200, { text: data?.choices?.[0]?.message?.content || '' });
    }

    if (openAiKey) {
      const upstream = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...messages,
          ],
          max_tokens: maxTokens,
        }),
      });

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return json(upstream.status, { error: data?.error?.message || 'OpenAI request failed' });
      }

      return json(200, { text: data?.choices?.[0]?.message?.content || '' });
    }

    if (anthropicKey) {
      const upstream = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          system,
          messages,
        }),
      });

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return json(upstream.status, { error: data?.error?.message || 'Anthropic request failed' });
      }

      const text = (data?.content || []).map((b) => b?.text || '').join('');
      return json(200, { text });
    }

    return json(400, {
      error: 'Missing server key. Set FREE_LLM_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in Netlify environment variables.',
    });
  } catch (err) {
    return json(500, { error: err.message || 'Unexpected server error' });
  }
};
