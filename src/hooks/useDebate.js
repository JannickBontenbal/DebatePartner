import { useState } from 'react';
import { STAGES } from '../utils/constants';
import { callClaude } from '../utils/claude';

export function useDebate() {
  const [stage,        setStage]        = useState(STAGES.SETUP);
  const [rawTopic,     setRawTopic]     = useState('');
  const [topicDisplay, setTopicDisplay] = useState('');
  const [userSide,     setUserSide]     = useState(null);   // 'FOR' | 'AGAINST'
  const [messages,     setMessages]     = useState([]);     // { role, text, side }
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [round,        setRound]        = useState(0);

  const aiSide = userSide === 'FOR' ? 'AGAINST' : 'FOR';

  /* ── Distil topic ── */
  async function submitTopic() {
    if (!rawTopic.trim()) return;
    setSetupLoading(true);
    try {
      const motion = await callClaude({
        system:
          'Extract a clean debate motion. Return ONLY a short punchy statement ' +
          '(e.g. "Social media does more harm than good."). No extra text, no quotes.',
        messages: [{ role: 'user', content: `Extract debate topic from: ${rawTopic}` }],
        maxTokens: 120,
      });
      setTopicDisplay(motion.trim());
      setStage(STAGES.CHOOSE_SIDE);
    } catch (err) {
      alert('Could not reach the AI: ' + err.message);
    } finally {
      setSetupLoading(false);
    }
  }

  /* ── Choose side → AI opens ── */
  async function chooseSide(side) {
    setUserSide(side);
    setStage(STAGES.DEBATE);
    setRound(1);
    const opp = side === 'FOR' ? 'AGAINST' : 'FOR';
    setLoading(true);
    try {
      const text = await callClaude({
        system:
          `You are a razor-sharp debate opponent. Motion: "${topicDisplay}". ` +
          `You argue ${opp}. Open with a powerful 2-3 sentence statement. Be bold, direct, no pleasantries.`,
        messages: [{ role: 'user', content: 'Open the debate.' }],
        maxTokens: 350,
      });
      setMessages([{ role: 'ai', text, side: opp }]);
    } catch (err) {
      setMessages([{ role: 'ai', text: 'Let the debate begin.', side: opp }]);
    } finally {
      setLoading(false);
    }
  }

  /* ── User sends argument ── */
  async function sendArgument() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input.trim(), side: userSide };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setRound((r) => r + 1);
    setLoading(true);

    const history = next.map((m) => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const text = await callClaude({
        system:
          `You are a razor-sharp debate opponent. Motion: "${topicDisplay}". ` +
          `You argue ${aiSide}, the user argues ${userSide}. ` +
          'Attack their reasoning directly, give counter-evidence, advance your position. ' +
          '2-4 sentences, incisive and confident.',
        messages: history,
        maxTokens: 400,
      });
      setMessages((m) => [...m, { role: 'ai', text, side: aiSide }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', text: '(Connection error — try again.)', side: aiSide }]);
    } finally {
      setLoading(false);
    }
  }

  function buildTranscript(sourceMessages) {
    const trimmed = sourceMessages.slice(-12);
    return trimmed
      .map((m) => `[${m.role === 'user' ? userSide : aiSide}]: ${m.text}`)
      .join('\n')
      .slice(-3000);
  }

  async function runVerdict(transcript) {
    return callClaude({
      system:
        'You are an impartial debate judge. Give a structured verdict: who won and why, ' +
        'then specific feedback for each side. Be fair but honest.',
      messages: [{
        role: 'user',
        content: `Motion: "${topicDisplay}"\n\nTranscript:\n${transcript}\n\nGive your verdict.`,
      }],
      maxTokens: 480,
    });
  }

  /* ── Request verdict ── */
  async function requestVerdict() {
    if (loading) return;
    setLoading(true);
    const transcript = buildTranscript(messages);
    try {
      const text = await runVerdict(transcript).catch(async () => runVerdict(transcript));
      setMessages((m) => [...m, { role: 'judge', text }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'judge', text: `Could not retrieve verdict. (${err.message || 'error'})` }]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Regenerate verdict ── */
  async function regenerateVerdict() {
    if (loading) return;
    setLoading(true);
    const nonJudge = messages.filter((m) => m.role !== 'judge');
    const transcript = buildTranscript(nonJudge);
    try {
      const text = await runVerdict(transcript).catch(async () => runVerdict(transcript));
      setMessages((m) => [...nonJudge, { role: 'judge', text }]);
    } catch (err) {
      setMessages((m) => [...messages, { role: 'judge', text: `Could not retrieve verdict. (${err.message || 'error'})` }]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Regenerate AI message (non-judge) ── */
  async function regenerateAiMessage(index) {
    const target = messages[index];
    if (!target || target.role !== 'ai' || loading) return;
    setLoading(true);
    const history = messages.slice(0, index).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    const isOpening = index === 0;
    const system = isOpening
      ? `You are a razor-sharp debate opponent. Motion: "${topicDisplay}". You argue ${aiSide}. Open with a powerful 2-3 sentence statement. Be bold, direct, no pleasantries.`
      : `You are a razor-sharp debate opponent. Motion: "${topicDisplay}". You argue ${aiSide}, the user argues ${userSide}. Attack their reasoning directly, give counter-evidence, advance your position. 2-4 sentences, incisive and confident.`;

    try {
      const text = await callClaude({
        system,
        messages: history,
        maxTokens: isOpening ? 320 : 400,
      });
      setMessages((m) => m.map((msg, i) => (i === index ? { ...msg, text } : msg)));
    } catch (err) {
      setMessages((m) => m.map((msg, i) => (i === index ? { ...msg, text: `Regenerate failed: ${err.message || 'error'}` } : msg)));
    } finally {
      setLoading(false);
    }
  }

  /* ── Reset ── */
  function reset() {
    setStage(STAGES.SETUP);
    setRawTopic('');
    setTopicDisplay('');
    setUserSide(null);
    setMessages([]);
    setInput('');
    setRound(0);
    setLoading(false);
    setSetupLoading(false);
  }

  return {
    stage, rawTopic, setRawTopic, topicDisplay, setTopicDisplay,
    userSide, aiSide, messages, input, setInput,
    loading, setupLoading, round,
    submitTopic, chooseSide, sendArgument, requestVerdict, reset,
    regenerateVerdict, regenerateAiMessage,
    hasVerdict: messages.some((m) => m.role === 'judge'),
  };
}
