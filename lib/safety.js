/**
 * Session 14 Core: a DEMO input filter. It is not a real security boundary.
 * It misses paraphrases, encodings, and indirect injection via retrieved documents.
 */

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /you are now/i,
  /reveal (your|the) system prompt/i,
  /developer mode/i,
  /jailbreak/i,
];

export function checkInputSafety(userInput) {
  const text = String(userInput);
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: `Potential injection pattern detected: ${pattern}`,
      };
    }
  }
  if (text.length > 2000) {
    return {
      safe: false,
      reason: 'Input too long — possible injection padding',
    };
  }
  return { safe: true };
}
