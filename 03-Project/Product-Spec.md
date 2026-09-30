# Product Spec

## Problem
People often have difficulty estimating the size and calorie content of a meal from a photo. Platewise provides a quick, approximate visual estimate from a food photo; a familiar object with known dimensions can optionally help estimate meal proportions.

## User
People who want a lightweight, informational meal estimate and students learning to build AI-enabled products.

## AI Role
Gemini Vision estimates food identity, portion size, and calories from the food photo and explains uncertainty. If the user supplies a scale-reference object, Gemini checks and uses it to improve the portion estimate; the reference is optional. A separate Gemini-backed knowledge assistant demonstrates retrieval-augmented generation and function calling over the sample Markdown vault.

## Success Metric
- Food-photo analysis returns a schema-valid AI response or a clear error, with or without the optional reference photo; it never labels a fixed fallback as an AI result.
- RAG answers include retrieved source filenames and report insufficient information when no sources are available.
- `npm test` passes, including embedding retrieval, image extraction, safe arithmetic, and model tool-call handling.
- Calorie-estimate accuracy must be evaluated against a labeled meal-photo dataset before making any accuracy claim; no clinical accuracy target has been established.

Calorie estimates are informational only and are not medical or dietary advice.
