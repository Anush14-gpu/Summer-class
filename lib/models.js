export const GENERATION_MODEL = 'gemini-3.8-flash';
export const FALLBACK_GENERATION_MODEL = 'gemini-3.5-flash-lite';
export const EMBEDDING_MODEL = 'gemini-embedding-2';

export async function generateContentWithRetry(ai, params, maxAttempts = 3) {
  const models = [GENERATION_MODEL, FALLBACK_GENERATION_MODEL];
  for (const [modelIndex, model] of models.entries()) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (error) {
        const status = Number(error?.status ?? error?.code);
        const retryable = [429, 500, 502, 503, 504].includes(status);
        const modelUnavailable = status === 404;
        if ((!retryable && !modelUnavailable) || modelIndex === models.length - 1) throw error;
        if (modelUnavailable || attempt === maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** (attempt - 1))));
      }
    }
  }
  throw new Error('Gemini generation failed without returning a response.');
}

export function parseJsonResponse(text) {
  const normalized = String(text ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(normalized);
}
