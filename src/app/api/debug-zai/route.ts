import { NextResponse } from 'next/server';
import { groqChatCompletion, getGroqApiKey } from '@/lib/llm';

// Debug endpoint — verifies Groq credentials and a real LLM call.
export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: [] as Array<{ step: string; status: 'ok' | 'fail'; detail: string }>,
  };

  // Step 1: verify env var
  try {
    const key = getGroqApiKey();
    debug.steps.push({
      step: 'env_check',
      status: 'ok',
      detail: `GROQ_API_KEY is set (${key.slice(0, 6)}...${key.slice(-4)})`,
    });
  } catch (err) {
    debug.steps.push({
      step: 'env_check',
      status: 'fail',
      detail: err instanceof Error ? err.message : 'unknown error',
    });
    return NextResponse.json(debug, { status: 200 });
  }

  // Step 2: try a real (tiny) chat completion
  try {
    const response = await groqChatCompletion(
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Reply with the single word: pong' },
      ],
      { maxTokens: 10 }
    );
    debug.steps.push({
      step: 'llm_call',
      status: 'ok',
      detail: `Response: ${response.slice(0, 100)}`,
    });
  } catch (err) {
    debug.steps.push({
      step: 'llm_call',
      status: 'fail',
      detail: err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error',
    });
  }

  return NextResponse.json(debug, { status: 200 });
}
