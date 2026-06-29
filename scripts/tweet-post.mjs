// Post a tweet from a draft markdown file.
// Usage: node scripts/tweet-post.mjs <path-to-draft.md>
// Example: node scripts/tweet-post.mjs tweets/drafts/2026-06-29T10-00-00-autoscore-t0.md

import fs from 'node:fs';
import path from 'node:path';
import { getTwitterClient } from './twitter-client.mjs';

const draftPath = process.argv[2];

if (!draftPath) {
  console.error('Usage: node scripts/tweet-post.mjs <path-to-draft.md>');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), draftPath);
if (!fs.existsSync(fullPath)) {
  console.error(`Draft file not found: ${draftPath}`);
  process.exit(1);
}

// Parse the draft markdown — extract the tweet text from the section
// between "# Tweet copy" and the next "---"
function extractTweetText(content) {
  const lines = content.split('\n');
  let inTweetSection = false;
  let tweetLines = [];
  let foundSection = false;

  for (const line of lines) {
    if (line.startsWith('# Tweet copy')) {
      inTweetSection = true;
      foundSection = true;
      continue;
    }
    if (inTweetSection) {
      if (line.trim() === '---') break;
      tweetLines.push(line);
    }
  }

  if (!foundSection) {
    console.error('Could not find "# Tweet copy" section in the draft.');
    process.exit(1);
  }

  // Trim leading/trailing blank lines
  while (tweetLines.length > 0 && tweetLines[0].trim() === '') tweetLines.shift();
  while (tweetLines.length > 0 && tweetLines[tweetLines.length - 1].trim() === '') tweetLines.pop();

  return tweetLines.join('\n');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      let value = m[2].replace(/^["']|["']$/g, '');
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (/^\d+$/.test(value)) value = parseInt(value, 10);
      frontmatter[m[1]] = value;
    }
  }
  return frontmatter;
}

const content = fs.readFileSync(fullPath, 'utf8');
const tweetText = extractTweetText(content);
const frontmatter = parseFrontmatter(content);

if (!tweetText.trim()) {
  console.error('Tweet text is empty.');
  process.exit(1);
}

// Final length check — X counts URLs as 23 chars (t.co wrapping)
const urlPattern = /https?:\/\/\S+/g;
const xWeightedLength = tweetText.replace(urlPattern, 'x'.repeat(23)).length;
if (xWeightedLength > 280) {
  console.error(`Tweet is ${xWeightedLength} X-weighted characters (raw: ${[...tweetText].length}). X limit is 280. Edit the draft and try again.`);
  process.exit(1);
}

// Confirm with user before posting
console.log('━'.repeat(60));
console.log('READY TO POST:');
console.log('━'.repeat(60));
console.log('');
console.log(tweetText);
console.log('');
console.log('━'.repeat(60));
console.log(`Characters: ${xWeightedLength} / 280 (X-weighted, URLs count as 23)`);
console.log(`Tool: ${frontmatter.tool_name || '(unknown)'}`);
console.log('');

// In non-interactive mode (e.g. CI), pass --yes to skip the prompt
const skipConfirm = process.argv.includes('--yes');
if (!skipConfirm) {
  // Simple synchronous prompt
  process.stdout.write('Post this tweet? [y/N] ');
  const answer = fs.readFileSync(0, 'utf8').trim().toLowerCase();
  if (answer !== 'y' && answer !== 'yes') {
    console.log('Cancelled. Tweet was not posted.');
    process.exit(0);
  }
}

// Post the tweet
try {
  const client = getTwitterClient();
  console.log('Posting to X...');
  const { data, errors } = await client.v2.tweet(tweetText);

  if (errors && errors.length > 0) {
    console.error('Twitter API returned errors:');
    for (const err of errors) {
      console.error(`  - ${err.title}: ${err.detail || err.message}`);
    }
    process.exit(1);
  }

  const tweetId = data.id;
  const username = data.author_id ? `(author_id: ${data.author_id})` : '';
  console.log(`✓ Tweet posted! ID: ${tweetId} ${username}`);
  console.log(`  URL: https://x.com/i/web/status/${tweetId}`);

  // Update frontmatter and move to posted/
  const postedDir = path.resolve(process.cwd(), 'tweets/posted');
  fs.mkdirSync(postedDir, { recursive: true });

  const postedContent = content
    .replace(/^status:\s*draft$/m, `status: posted`)
    .replace(/^draft_created:/m, `posted_at: ${new Date().toISOString()}\ndraft_created:`)
    + `\n# Posted\n\n- Tweet ID: ${tweetId}\n- Posted at: ${new Date().toISOString()}\n- URL: https://x.com/i/web/status/${tweetId}\n`;

  const postedPath = path.join(postedDir, `${path.basename(fullPath, '.md')}-posted-${tweetId}.md`);
  fs.writeFileSync(postedPath, postedContent);

  // Remove the original draft
  fs.unlinkSync(fullPath);

  console.log(`  Draft moved to: ${postedPath.replace(process.cwd() + '/', '')}`);
} catch (err) {
  console.error('Failed to post tweet:');
  if (err.code) {
    console.error(`  Error code: ${err.code}`);
  }
  if (err.data) {
    console.error(`  Response: ${JSON.stringify(err.data, null, 2)}`);
  } else {
    console.error(`  ${err.message}`);
  }
  console.error('');
  console.error('Common causes:');
  console.error('  - Access Token / Secret not generated (OAuth 1.0a User Context required)');
  console.error('  - App permissions set to Read-only (must be Read and Write)');
  console.error('  - Duplicate tweet (X rejects identical text within a short window)');
  console.error('  - Free tier limit hit (1,500 posts/month)');
  process.exit(1);
}
