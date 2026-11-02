/**
 * bridge-warn.ts — one console.warn per reason and entity.
 *
 * A warn placed in a render path fires at every repaint. The Set below is the
 * dedupe; only `SciFiBridgeCard.setConfig()` clears it, so a fixed-then-broken
 * entity is reported again.
 * Spec: docs/specs/bridge-error-matrix/spec.md FR-1, FR-2.
 */

type BridgeWarnReason = 'not-found' | 'non-numeric';

const MESSAGES: Record<BridgeWarnReason, string> = {
  'not-found': '[sf-bridge] entity not found:',
  'non-numeric': '[sf-bridge] non-numeric state:',
};

const seen = new Set<string>();

/** Warns the first time a reason+entity pair is seen since the last reset. */
export function warnOnce(reason: BridgeWarnReason, entityId: unknown): void {
  if (typeof entityId !== 'string' || entityId === '') return;
  const key = `${reason}:${entityId}`;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(MESSAGES[reason], entityId);
}

export function resetBridgeWarnings(): void {
  seen.clear();
}

/**
 * Reads a numeric slot (pellet, stock, EV power): a finite number >= 0, else
 * undefined — a negative value is not a measurement there. The reason it is
 * empty is reported once: `not-found` for an absent entity, `non-numeric` for a
 * present one that does not hold a measurement.
 */
export function readSlotOrWarn(
  states: Record<string, { state?: string } | undefined>,
  entityId: string
): number | undefined {
  const stateObj = states[entityId];
  const n = parseFloat(stateObj?.state ?? 'NaN');
  if (Number.isFinite(n) && n >= 0) return n;
  warnOnce(stateObj === undefined ? 'not-found' : 'non-numeric', entityId);
  return undefined;
}
