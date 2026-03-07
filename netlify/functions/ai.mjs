import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

const anthropic = new Anthropic();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: corsHeaders() },
    );
  }

  try {
    const { system = '', messages = [], maxTokens = 400 } = await req.json();

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    });

    const text = (message.content || [])
      .map((block) => block.text || '')
      .join('');

    return Response.json({ text }, { headers: corsHeaders() });
  } catch (err) {
    const status = err.status || 500;
    return Response.json(
      { error: err.message || 'Unexpected server error' },
      { status, headers: corsHeaders() },
    );
  }
};
