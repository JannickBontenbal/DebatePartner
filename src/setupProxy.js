const express = require('express');

module.exports = function setup(app) {
  const json = express.json({ limit: '1mb' });
  const defaultKey =
    process.env.REACT_APP_FREE_LLM_API_KEY || process.env.FREE_LLM_API_KEY || '';

  const buildPrompt = (system = '', messages = []) => {
    const parts = [];
    if (system) parts.push(`System:\n${system}`);
    (messages || []).forEach((m) => {
      const role = m?.role || 'user';
      const content = m?.content || '';
      parts.push(`${role}:\n${content}`);
    });
    return parts.join('\n\n');
  };

  app.post('/api/dev-llm', json, async (req, res) => {
    try {
      const bodyKey = (req.body && req.body.apiKey) || '';
      const bodyUrl = (req.body && req.body.apiUrl) || '';
      const apiKey = bodyKey || defaultKey;
      const apiUrl = (bodyUrl || 'https://apifreellm.com/api/v1/chat').trim();

      if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

      const { system = '', messages = [], maxTokens = 400 } = req.body || {};
      const prompt = buildPrompt(system, messages);

      const isOpenAI = apiUrl.includes('openai.com');
      const isOpenRouter = apiUrl.includes('openrouter.ai');
      const isAnthropic = apiUrl.includes('anthropic.com');

      let targetUrl = apiUrl;
      const headers = { 'Content-Type': 'application/json' };
      const modelFromReq = req.body?.model;
      let body;

      if (isOpenAI || isOpenRouter) {
        targetUrl = apiUrl.endsWith('/')
          ? `${apiUrl}chat/completions`
          : `${apiUrl}/chat/completions`;
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          model: modelFromReq || 'gpt-4o-mini',
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...(messages || []),
          ],
          max_tokens: maxTokens,
        };
      } else if (isAnthropic) {
        targetUrl = apiUrl.endsWith('/')
          ? `${apiUrl}messages`
          : `${apiUrl}/messages`;
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        body = {
          model: modelFromReq || 'claude-3-haiku-20240307',
          max_tokens: maxTokens,
          system,
          messages,
        };
      } else {
        headers.Authorization = `Bearer ${apiKey}`;
        body = { message: prompt, max_tokens: maxTokens };
      }

      const upstream = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await upstream.json().catch(() => ({}));

      if (upstream.status === 429) {
        return res.status(429).json({ error: 'Rate limited by upstream. Wait ~30 seconds and retry.' });
      }

      if (!upstream.ok || data?.success === false) {
        return res
          .status(upstream.status || 502)
          .json({ error: data?.error || data?.message || 'Upstream error' });
      }

      const text = data?.response || data?.text || '';
      return res.json({ text });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Proxy failure' });
    }
  });
};
