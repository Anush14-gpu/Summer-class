# AI Risk Report

## 1. Application description and intended use
Platewise verifies a user-supplied scale object and estimates food identity, portion size, and calories from photos. The project also includes a Gemini-backed document Q&A endpoint, function-calling tools, image extraction, and a command-line agent exercise. Nutrition output is an uncertain estimate, not medical advice.

## 2. Threat model
- Untrusted text in a user query, retrieved note, brand, object label, or image may try to redirect model behavior.
- Users may submit malformed, oversized, misleading, or low-quality images and prompts.
- A leaked API key could enable unauthorized Gemini usage and charges.
- Food images and reference-object photos may contain personal or sensitive information.
- Visual models may perform inconsistently across cuisines, packaging, lighting, camera angles, and accessibility needs.

## 3. Identified risks and mitigations
- **Inaccurate nutrition estimates:** portion and calorie values are model estimates. The UI reports confidence and a caveat; results are explicitly labeled as Gemini estimates and the product disclaims medical use. Accuracy is not established by the unit tests.
- **Prompt injection:** `/query` and `/tools` apply a small deterministic input filter; model instructions treat user text, retrieved notes, and image text as untrusted. These measures are defense-in-depth only and do not reliably detect prompt injection.
- **Privacy:** photos are sent to Gemini through the server. The API key is kept server-side. The reference photo and profile persist in browser `localStorage`; the UI warns users and provides a “Forget saved reference” control.
- **Abuse and cost:** JSON request bodies are limited to 12 MB, image types and dimensions are checked, and arithmetic is parsed without `eval`. There is no authentication or rate limiting.
- **Service or model failure:** missing API configuration returns HTTP 503; upstream/model errors return explicit errors rather than synthetic AI answers. The health endpoint reports whether a key is configured.

## 4. Residual risks
The input filter is bypassable, model outputs can be wrong or biased, and provider-side processing is governed by Google's service terms. Requests are not authenticated or rate-limited. The implementation has not been evaluated for nutrition accuracy or fairness across demographic and food groups.

## 5. Monitoring plan
Check `/health` during operation and review server-side AI failure logs. Run `npm test` after code changes and use the interactive evaluation workflow with representative, human-reviewed test cases. Track API quota and billing in the provider console. Do not log submitted photos or API keys.
