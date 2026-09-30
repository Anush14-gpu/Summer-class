/**
 * Session 10 Core: chained generateContent steps (not ReAct / not tools).
 *
 *   npm run agent-task -- "Your multi-step goal here"
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { GENERATION_MODEL, generateContentWithRetry } from '../lib/models.js';

async function askAi(ai, prompt) {
  const response = await generateContentWithRetry(ai, {
    model: GENERATION_MODEL,
    contents: prompt,
    config: { temperature: 0.3 },
  });
  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

async function runAgentTask(ai, goal) {
  const steps = [];
  let context = `Goal: ${goal}\n\n`;

  const plan = await askAi(ai, `${context}List 4 specific steps. Number them.`);
  steps.push({ step: 'PLAN', output: plan });
  context += `Plan:\n${plan}\n\n`;

  for (let stepNum = 1; stepNum <= 4; stepNum += 1) {
    const output = await askAi(
      ai,
      `${context}Execute step ${stepNum} only. Produce complete output for this step.`
    );
    steps.push({ step: `EXECUTE_${stepNum}`, output });
    context += `Step ${stepNum} output:\n${output}\n\n`;
  }

  const final = await askAi(
    ai,
    `${context}Combine all step outputs into one coherent deliverable.`
  );
  steps.push({ step: 'SYNTHESISE', output: final });
  return { steps, finalOutput: final };
}

async function main() {
  const goal = process.argv.slice(2).join(' ').trim();
  if (!goal) {
    console.error('Usage: npm run agent-task -- "your goal"');
    process.exit(1);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const result = await runAgentTask(ai, goal);
  for (const s of result.steps) {
    console.log('\n====', s.step, '====\n');
    console.log(s.output);
  }
  console.log('\n==== FINAL ====\n');
  console.log(result.finalOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
