/**
 * Session 13 Core: POST each test-suite.json question to /query and print for scoring.
 *
 *   # terminal 1: npm run dev
 *   # terminal 2: npm run eval
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const suitePath = path.join(root, 'test-suite.json');
const baseUrl = process.env.APP_URL || 'http://localhost:3000';

async function main() {
  if (!fs.existsSync(suitePath)) {
    throw new Error('Create test-suite.json with [{ "question", "expected", "category" }, ...].');
  }

  const cases = JSON.parse(fs.readFileSync(suitePath, 'utf8'));
  if (!Array.isArray(cases) || !cases.length ||
      cases.some((item) => typeof item.question !== 'string' || typeof item.expected !== 'string')) {
    throw new Error('Test suite must be a non-empty array of cases with string question and expected fields.');
  }
  const requestedLimit = Number(process.env.EVAL_LIMIT || 10);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw new Error('EVAL_LIMIT must be a positive integer.');
  }
  const limit = Math.min(cases.length, requestedLimit);
  const rl = readline.createInterface({ input, output });
  const results = [];

  async function askScore(label) {
    while (true) {
      const score = Number(await rl.question(`${label} (1-5): `));
      if (Number.isInteger(score) && score >= 1 && score <= 5) return score;
      console.log('Enter a whole number from 1 through 5.');
    }
  }

  try {
    for (let i = 0; i < limit; i += 1) {
      const item = cases[i];
      const response = await fetch(`${baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.question }),
      });
      const data = await response.json();
      const actual = data.response || data.answer || data.error || JSON.stringify(data);

      console.log('\n---');
      console.log(`Q: ${item.question}`);
      console.log(`Expected: ${item.expected}`);
      console.log(`Actual (HTTP ${response.status}): ${actual}`);

      const correctness = await askScore('Correctness');
      const relevance = await askScore('Relevance');
      const notes = await rl.question('Notes (optional): ');
      results.push({
        question: item.question,
        category: item.category ?? 'uncategorized',
        status: response.status,
        correctness,
        relevance,
        notes,
      });
    }
  } finally {
    rl.close();
  }
  const outPath = path.join(root, 'eval-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  const avgC = results.reduce((sum, item) => sum + item.correctness, 0) / results.length;
  const avgR = results.reduce((sum, item) => sum + item.relevance, 0) / results.length;
  console.log(`\nAverage Correctness: ${avgC.toFixed(1)}/5`);
  console.log(`Average Relevance: ${avgR.toFixed(1)}/5`);
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
