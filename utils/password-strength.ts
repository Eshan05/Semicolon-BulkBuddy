/**
 * Returns a score from 0..5.
 *
 * Scoring rules (simple + predictable for UX):
 * - length >= 8
 * - has lowercase
 * - has uppercase
 * - has number
 * - has special (!@#$%^&*)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  const rules = [
    /.{8,}/, // length
    /[a-z]/,
    /[A-Z]/,
    /[0-9]/,
    /[!@#$%^&*]/,
  ];

  const score = rules.reduce((acc, r) => (r.test(password) ? acc + 1 : acc), 0);
  return Math.max(0, Math.min(5, score));
}
