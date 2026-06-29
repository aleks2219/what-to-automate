// Generate a tweet draft for any tool in the registry.
// Usage: node scripts/tweet-draft.mjs <tool-slug> [template-index]
// Example: node scripts/tweet-draft.mjs build-vs-buy
//          node scripts/tweet-draft.mjs autoscore 0

import fs from 'node:fs';
import path from 'node:path';

const slug = process.argv[2];
const templateIdx = process.argv[3] ? parseInt(process.argv[3], 10) : 0;

if (!slug) {
  console.error('Usage: node scripts/tweet-draft.mjs <tool-slug> [template-index]');
  console.error('Available tools:');
  console.error('  - autoscore (Automation Evaluator)');
  console.error('  - build-vs-buy (Build vs. Buy)');
  console.error('  - startup-idea-validator (Idea Validator — coming soon)');
  console.error('');
  console.error('Note: This script reads from tweets/tools/<slug>.json for tweet metadata.');
  process.exit(1);
}

// Load tool metadata
const toolPath = path.resolve(process.cwd(), 'tweets/tools', `${slug}.json`);
const registryMap = {
  'autoscore': 'autoscore',
  'automation-evaluator': 'autoscore',
  'build-vs-buy': 'build-vs-buy',
  'startup-idea-validator': 'startup-idea-validator',
};

const actualSlug = registryMap[slug] || slug;
const actualPath = path.resolve(process.cwd(), 'tweets/tools', `${actualSlug}.json`);

if (!fs.existsSync(actualPath)) {
  console.error(`No metadata file found at tweets/tools/${actualSlug}.json`);
  console.error('Create one with: name, url, tagline, key_features, tweetTemplates');
  process.exit(1);
}

const tool = JSON.parse(fs.readFileSync(actualPath, 'utf8'));

// Use tweet templates from the tool config, or fall back to defaults
const templates = tool.tweetTemplates || [
  `${tool.tagline}\n\nTry it: ${tool.url}`,
  `New tool: ${tool.name}\n\n${tool.tagline}\n\n${tool.url}`,
  `I built ${tool.name}. ${tool.tagline}\n\nFree, no login: ${tool.url}`,
];

const idx = Math.min(templateIdx, templates.length - 1);
const tweetText = templates[idx].replace('{url}', tool.url).replace('{name}', tool.name).replace('{tagline}', tool.tagline);

// Validate length
const length = [...tweetText].length;
if (length > 280) {
  console.warn(`⚠️  Tweet is ${length} characters (X limit is 280). Trim before posting.`);
}

// Generate draft file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const draftDir = path.resolve(process.cwd(), 'tweets/drafts');
fs.mkdirSync(draftDir, { recursive: true });
const draftPath = path.join(draftDir, `${timestamp}-${actualSlug}-t${idx}.md`);

const draftContent = `---
tool: ${actualSlug}
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

- Character count: ${length} / 280 ${length > 280 ? '⚠️  TOO LONG' : '✓'}
- Template: ${idx} of ${templates.length - 1}
- To preview another template: \`node scripts/tweet-draft.mjs ${slug} <0-${templates.length - 1}>\`
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
console.log(`Or try another template: node scripts/tweet-draft.mjs ${slug} <0-${templates.length - 1}>`);
