import { NextResponse } from 'next/server';
import { getZaiClient } from '@/lib/zai-config';

// Temporary debug endpoint — verifies that the new code is deployed
// and that env vars are present. Safe to delete after debugging.
export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env_vars: {
      Z_AI_BASE_URL: process.env.Z_AI_BASE_URL ? '✓ set' : '✗ missing',
      Z_AI_API_KEY: process.env.Z_AI_API_KEY ? '✓ set' : '✗ missing',
      Z_AI_TOKEN: process.env.Z_AI_TOKEN ? '✓ set' : '✗ missing',
      Z_AI_CHAT_ID: process.env.Z_AI_CHAT_ID ? '✓ set' : '✗ missing',
      Z_AI_USER_ID: process.env.Z_AI_USER_ID ? '✓ set' : '✗ missing',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '✗ missing',
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY ? '✓ set' : '✗ missing',
    },
    code_check: {
      uses_getZaiClient: 'should be true if new code is deployed',
    },
  };

  // Try constructing the client
  try {
    const client = getZaiClient();
    debug.client_construction = '✓ success';
    debug.client_has_chat = !!client?.chat;
    debug.client_has_completions = !!client?.chat?.completions;
  } catch (err) {
    debug.client_construction = `✗ failed: ${err instanceof Error ? err.message : 'unknown'}`;
  }

  return NextResponse.json(debug, { status: 200 });
}
