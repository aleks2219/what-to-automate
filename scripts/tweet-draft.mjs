// Generate a tweet draft for a tool.
// Usage: node scripts/tweet-draft.mjs <tool-name> [template-index]
// Example: node scripts/tweet-draft.mjs autoscore

import fs from 'node:fs';
import path from 'node:path';

const toolName = process.argv[2];
const templateIdx = process.argv[3] ? parseInt(process.argv[3], 10) : null;

if (!toolName) {
  console.error('Usage: node scripts/tweet-draft.mjs <tool-name> [template-index]');
  console.error('Available tools:');
  const toolsDir = path.resolve(process.cwd(), 'tweets/tools');
  if (fs.existsSync(toolsDir)) {
    const tools = fs.readdirSync(toolsDir).filter((f) => f.endsWith('.json'));
    tools.forEach((t) => console.error(`  - ${t.replace(/\.json$/, '')}`));
  }
  process.exit(1);
}

const toolPath = path.resolve(process.cwd(), 'tweets/tools', `${toolName}.json`);
if (!fs.existsSync(toolPath)) {
  console.error(`No metadata file found at tweets/tools/${toolName}.json`);
  console.error('Create one with: name, url, tagline, key_features, example_use_case');
  process.exit(1);
}

const tool = JSON.parse(fs.readFileSync(toolPath, 'utf8'));

// Validate required fields
const required = ['name', 'url', 'tagline', 'key_features'];
const missing = required.filter((k) => !tool[k]);
if (missing.length > 0) {
  console.error(`Tool metadata missing required fields: ${missing.join(', ')}`);
  process.exit(1);
}

// ============================================================
// Tweet templates — "builder-direct" tone
// (short, factual, founder-led — per user preference)
// ============================================================

const templates = [
  // Template 0: lead with the question
  (t) => `${t.tagline}

I built a free tool that takes one sentence about a workflow and gives you a leadership-ready assessment: verdict, ROI, payback, risks, and rollout roadmap.

Try it: ${t.url}`,

  // Template 1: lead with the pain point
  (t) => `Most leaders automate the wrong things.

I built a tool to help: describe a process in one sentence (or paste an SOP, or just talk) → get a verdict, ROI, payback period, risks, and a phased roadmap.

Free, no signup: ${t.url}`,

  // Template 2: lead with what it does
  (t) => `New tool: ${t.name}

- ${t.tagline}
- Input: one sentence, a pasted doc, or a 30s voice memo
- Output: verdict, ROI, payback, risks, rollout roadmap
- Export to PDF for board memos

${t.url}`,

  // Template 3: lead with example
  (t) => `"${t.example_use_case || 'Should you automate that process?'}"

That's all the input my new tool needs. It extracts the rest with AI and gives you a decision-ready report.

${t.url}`,

  // Template 4: short + punchy
  (t) => `Should you automate that process?

I built a tool that answers it in 60 seconds. One sentence in, leadership-ready report out.

${t.url}`,
];

const idx = templateIdx !== null ? templateIdx : 0;
if (idx < 0 || idx >= templates.length) {
  console.error(`Invalid template index. Must be 0–${templates.length - 1}.`);
  process.exit(1);
}

const tweetText = templates[idx](tool);

// Validate length (X limit is 280 for non-premium accounts)
const length = [...tweetText].length;
if (length > 280) {
  console.warn(`⚠️  Tweet is ${length} characters (X limit is 280). Trim before posting.`);
}

// Generate draft file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const draftDir = path.resolve(process.cwd(), 'tweets/drafts');
fs.mkdirSync(draftDir, { recursive: true });
const draftPath = path.join(draftDir, `${timestamp}-${toolName}-t${idx}.md`);

const draftContent = `---
tool: ${toolName}
tool_name: "${tool.name}"
tool_url: ${tool.url}
template: ${idx}
draft_created: ${new Date().toISOString()}
status: draft
char_count: ${length}
---

# Tweet copy (template #${idx})

${tweetText}

---

# Notes for review

- Character count: ${length} / 280
- Template: ${idx} of ${templates.length - 1}
- To preview another template: \`node scripts/tweet-draft.mjs ${toolName} <0-${templates.length - 1}>\`
- Edit the copy above, then run: \`node scripts/tweet-post.mjs ${draftPath.replace(process.cwd() + '/', '')}\`
`;

fs.writeFileSync(draftPath, draftContent);

console.log('━'.repeat(60));
console.log(`Draft generated: tweets/drafts/${path.basename(draftPath)}`);
console.log('━'.repeat(60));
console.log('');
console.log(tweetText);
console.log('');
console.log('━'.repeat(60));
console.log(`Characters: ${length} / 280 ${length > 280 ? '⚠️  TOO LONG' : '✓'}`);
console.log('');
console.log('Next steps:');
console.log(`  1. Edit the draft: ${draftPath.replace(process.cwd() + '/', '')}`);
console.log(`  2. Post when ready: node scripts/tweet-post.mjs ${draftPath.replace(process.cwd() + '/', '')}`);
console.log('');
console.log(`Or try another template: node scripts/tweet-draft.mjs ${toolName} <0-${templates.length - 1}>`);
