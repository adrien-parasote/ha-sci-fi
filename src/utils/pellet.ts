/**
 * pellet.ts — one reading of a pellet-quantity sensor, shared by the stove
 * card and the bridge's stove section (they read the same entity).
 *
 * A value ≤ 1 is a ratio (0.6 → 60), above it a percentage; the result is a
 * 0–100 integer for sf-circle-progress-bar.
 * Spec: docs/specs/cards/stove.md § Error Handling Matrix (bead ha-sci-fi-15v).
 */
export function normalizePelletPct(raw: number): number {
  const pct = raw > 1 ? raw : raw * 100;
  return Math.min(Math.max(Math.round(pct), 0), 100);
}
