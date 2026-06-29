import { NextResponse } from 'next/server';
import { getZaiClient } from '@/lib/zai-config';

// Temporary debug endpoint — tries a real LLM call and returns full diagnostic info.
export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: [] as Array<{ step: string; status: 'ok' | 'fail'; detail: string }>,
  };

  // Step 1: verify env vars
  const baseUrl = process.env.Z_AI_BASE_URL;
  const apiKey = process.env.Z_AI_API_KEY;
  if (!baseUrl || !apiKey) {
    debug.steps.push({
      step: 'env_check',
      status: 'fail',
      detail: `Missing Z_AI_BASE_URL or Z_AI_API_KEY`,
    });
    return NextResponse.json(debug, { status: 200 });
  }
  debug.steps.push({ step: 'env_check', status: 'ok', detail: `${baseUrl} (key: ${apiKey})` });

  // Step 2: try to reach the API endpoint with a HEAD request
  try {
    const healthUrl = baseUrl.replace(/\/v1$/, '') + '/health';
    const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
    debug.steps.push({
      step: 'api_reachability',
      status: 'ok',
      detail: `GET ${healthUrl} → ${res.status} ${res.statusText}`,
    });
  } catch (err) {
    debug.steps.push({
      step: 'api_reachability',
      status: 'fail',
      detail: `${err instanceof Error ? err.name + ': ' + err.message : 'unknown error'}`,
    });
  }

  // Step 3: try to resolve the hostname via DNS
  try {
    const hostname = new URL(baseUrl).hostname;
    const { lookup } = await import('node:dns/promises');
    const result = await lookup(hostname);
    debug.steps.push({
      step: 'dns_resolution',
      status: 'ok',
      detail: `${hostname} → ${result.address}`,
    });
  } catch (err) {
    debug.steps.push({
      step: 'dns_resolution',
      status: 'fail',
      detail: `${err instanceof Error ? err.name + ': ' + err.message : 'unknown error'}`,
    });
  }

  // Step 4: try a real (tiny) chat completion
  try {
    const client = getZaiClient();
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Reply with the single word: pong' },
      ],
      thinking: { type: 'disabled' },
    });
    const content = completion.choices?.[0]?.message?.content || '(empty)';
    debug.steps.push({
      step: 'llm_call',
      status: 'ok',
      detail: `Response: ${content.slice(0, 100)}`,
    });
  } catch (err) {
    debug.steps.push({
      step: 'llm_call',
      status: 'fail',
      detail: `${err instanceof Error ? err.name + ': ' + err.message : 'unknown error'}`,
    });
  }

  return NextResponse.json(debug, { status: 200 });
}
