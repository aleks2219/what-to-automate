// Construct a ZAI client directly from environment variables.
// This bypasses the SDK's file-based config loading (which doesn't work on
// Vercel serverless functions because the filesystem is read-only).
//
// Required env vars:
//   Z_AI_BASE_URL  — e.g. https://internal-api.z.ai/v1
//   Z_AI_API_KEY   — e.g. Z.ai
//   Z_AI_TOKEN     — JWT session token
//   Z_AI_CHAT_ID   — chat session ID
//   Z_AI_USER_ID   — user ID

import ZAI from 'z-ai-web-dev-sdk';

let cachedClient: any = null;

export function getZaiClient() {
  if (cachedClient) return cachedClient;

  const baseUrl = process.env.Z_AI_BASE_URL;
  const apiKey = process.env.Z_AI_API_KEY;
  const token = process.env.Z_AI_TOKEN;
  const chatId = process.env.Z_AI_CHAT_ID;
  const userId = process.env.Z_AI_USER_ID;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Z AI configuration missing. Set Z_AI_BASE_URL and Z_AI_API_KEY environment variables.'
    );
  }

  const config: Record<string, string> = { baseUrl, apiKey };
  if (token) config.token = token;
  if (chatId) config.chatId = chatId;
  if (userId) config.userId = userId;

  // Construct directly — skips the SDK's file-based loadConfig() entirely.
  cachedClient = new ZAI(config);
  return cachedClient;
}
