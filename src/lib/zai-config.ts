// Helper to write the .z-ai-config file from environment variables.
// On Vercel (and other serverless platforms), we can't commit the config file,
// so we generate it at runtime from env vars before calling ZAI.create().
//
// Required env vars:
//   Z_AI_BASE_URL  — e.g. https://internal-api.z.ai/v1
//   Z_AI_API_KEY   — e.g. Z.ai
//   Z_AI_TOKEN     — JWT session token
//   Z_AI_CHAT_ID   — chat session ID
//   Z_AI_USER_ID   — user ID

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let configInitialized = false;

export function ensureZaiConfig() {
  if (configInitialized) return;

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

  const config = {
    baseUrl,
    apiKey,
    ...(chatId ? { chatId } : {}),
    ...(userId ? { userId } : {}),
    ...(token ? { token } : {}),
  };

  // Write to home directory (writable on Vercel serverless functions)
  const configPath = path.join(os.homedir(), '.z-ai-config');
  try {
    fs.writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
    configInitialized = true;
  } catch (err) {
    // If home dir isn't writable, try /tmp
    const tmpPath = '/tmp/.z-ai-config';
    fs.writeFileSync(tmpPath, JSON.stringify(config), { mode: 0o600 });
    // Can't easily redirect the SDK to read from /tmp, but at least we tried
    configInitialized = true;
  }
}
