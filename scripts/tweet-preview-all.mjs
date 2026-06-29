// Print all 5 tweet templates cleanly for user review.
import fs from 'node:fs';
import path from 'node:path';

const tool = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'tweets/tools/autoscore.json'), 'utf8')
);

const templates = [
  (t) => `${t.tagline}

I built a free tool that takes one sentence about a workflow and gives you a leadership-ready assessment: verdict, ROI, payback, risks, and rollout roadmap.

Try it: ${t.url}`,

  (t) => `Most leaders automate the wrong things.

I built a tool to help: describe a process in one sentence (or paste an SOP, or just talk) → get a verdict, ROI, payback period, risks, and a phased roadmap.

Free, no signup: ${t.url}`,

  (t) => `New tool: ${t.name}

- ${t.tagline}
- Input: one sentence, a pasted doc, or a 30s voice memo
- Output: verdict, ROI, payback, risks, rollout roadmap
- Export to PDF for board memos

${t.url}`,

  (t) => `"${t.example_use_case}"

That's all the input my new tool needs. It extracts the rest with AI and gives you a decision-ready report.

${t.url}`,

  (t) => `Should you automate that process?

I built a tool that answers it in 60 seconds. One sentence in, leadership-ready report out.

${t.url}`,
];

console.log('AutoScore tweet drafts — pick one to post\n');
console.log('URL: ' + tool.url + '\n');

templates.forEach((tpl, i) => {
  const text = tpl(tool);
  const chars = [...text].length;
  console.log('════════════════════════════════════════════════════════════');
  console.log(`OPTION ${i} — ${chars} chars ${chars > 280 ? '⚠️  TOO LONG' : '✓'}`);
  console.log('════════════════════════════════════════════════════════════');
  console.log(text);
  console.log('');
});
