# Product Spec

## Problem
People often have difficulty estimating the size and calorie content of a meal from a photo. Platewise provides a quick, approximate visual estimate using a familiar object as a scale reference.

## User
People who want a lightweight, informational meal estimate and students learning to build AI-enabled products.

## AI Role
Gemini Vision checks the reference-object photo, identifies the object in a food photo, estimates the portion and calories, and explains uncertainty. A separate Gemini-backed knowledge assistant demonstrates retrieval-augmented generation and function calling over the sample Markdown vault.

## Success Metric
- Both photo workflows return schema-valid AI responses or a clear error; they never label a fixed fallback as an AI result.
- RAG answers include retrieved source filenames and report insufficient information when no sources are available.
- `npm test` passes, including embedding retrieval, image extraction, safe arithmetic, and model tool-call handling.
- Calorie-estimate accuracy must be evaluated against a labeled meal-photo dataset before making any accuracy claim; no clinical accuracy target has been established.

Calorie estimates are informational only and are not medical or dietary advice.
