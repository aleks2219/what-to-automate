// Shared Twitter API client for tweet-draft and tweet-post scripts.
// Uses OAuth 1.0a User Context (required for POST /2/tweets).

import TwitterApi from 'twitter-api-v2';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('No .env file found. Copy .env.example to .env and fill in your Twitter API credentials.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}

export function getTwitterClient() {
  const env = loadEnv();
  const required = [
    'TWITTER_CONSUMER_KEY',
    'TWITTER_CONSUMER_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
  ];
  const missing = required.filter((k) => !env[k] || env[k].startsWith('your_'));
  if (missing.length > 0) {
    console.error(`Missing Twitter API credentials in .env: ${missing.join(', ')}`);
    console.error('');
    console.error('To generate the Access Token + Secret:');
    console.error('1. Go to https://developer.x.com/en/portal/dashboard');
    console.error('2. Click your App → Settings');
    console.error('3. Under "User authentication settings" → Edit → enable "Read and Write"');
    console.error('4. Under "Keys and tokens" → "Access Token and Secret" → Generate');
    console.error('5. Copy the Access Token and Access Token Secret into .env');
    process.exit(1);
  }

  return new TwitterApi({
    appKey: env.TWITTER_CONSUMER_KEY,
    appSecret: env.TWITTER_CONSUMER_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
  });
}

export function getEnvVar(key) {
  const env = loadEnv();
  return env[key];
}
