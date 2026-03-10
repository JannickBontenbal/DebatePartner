const express = require('express');

module.exports = function setup(app) {
  const json = express.json({ limit: '1mb' });
  const apiKey =
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
      if (!apiKey) {
        return res.status(400).json({ error: 'Missing FREE_LLM_API_KEY' });
      }

      const { system = '', messages = [], maxTokens = 400 } = req.body || {};
      const prompt = buildPrompt(system, messages);

      const upstream = await fetch('https://apifreellm.com/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message: prompt, max_tokens: maxTokens }),
      });

      const data = await upstream.json().catch(() => ({}));

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
