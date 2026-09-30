import { EMBEDDING_MODEL } from './models.js';

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export async function embedText(ai, text, taskType = 'RETRIEVAL_DOCUMENT') {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Embedding text must not be empty.');
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType },
  });
  const values = response.embeddings?.[0]?.values;
  if (!Array.isArray(values) || !values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Gemini returned an invalid text embedding.');
  }
  return values;
}
