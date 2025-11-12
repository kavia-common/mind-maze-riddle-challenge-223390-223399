/**
 * Utilities for environment flags and answer checks.
 */

// PUBLIC_INTERFACE
export function getFeatureFlags() {
  /** Return decoded feature flags from REACT_APP_FEATURE_FLAGS or REACT_APP_EXPERIMENTS_ENABLED */
  const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
  const experiments = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

  const flags = {};
  if (raw) {
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(kv => {
      const [k, v] = kv.split('=');
      flags[k] = (v ?? 'true').toLowerCase() === 'true';
    });
  }
  // default toggle example
  if (flags.confetti === undefined) flags.confetti = experiments;
  return flags;
}

// PUBLIC_INTERFACE
export function normalizeAnswer(v) {
  /** Normalize user input for safe, case-insensitive comparison and basic XSS safety. */
  if (typeof v !== 'string') return '';
  // strip basic HTML tags and trim
  const stripped = v.replace(/<[^>]*>?/gm, '');
  return stripped.trim().toLowerCase();
}

// PUBLIC_INTERFACE
export function isCorrectAnswer(userInput, acceptedAnswers) {
  /** Returns true when the normalized user answer matches any of the accepted answers (case-insensitive). */
  const norm = normalizeAnswer(userInput);
  return acceptedAnswers.some(ans => normalizeAnswer(ans) === norm);
}
