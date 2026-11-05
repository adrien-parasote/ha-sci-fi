/**
 * Pure helpers of the stove card diagnostics (door, alert, error).
 * Spec: docs/specs/stove-diagnostics/spec.md FR-3, FR-5, FR-7, FR-14.
 */
import { DOMAIN } from '../../types/domains.js';
import type { HassEntity } from '../../types/ha.js';

export type DiagnosticKind = 'door' | 'alert' | 'error';

/** One rendered line (FR-6): its visible text and the capped text of its title (FR-14). */
export interface DiagnosticLine {
  readonly kind: DiagnosticKind;
  readonly text: string;
  readonly capped: string;
}

/** FR-6: one icon per kind, so the kind does not rest on colour alone. */
export const DIAGNOSTIC_ICONS: Readonly<Record<DiagnosticKind, string>> = {
  door: 'mdi:door-open',
  alert: 'mdi:alert',
  error: 'mdi:alert-octagon',
};

/** FR-5 (D8): the domain each field is read from. */
export const DIAGNOSTIC_DOMAINS: Readonly<Record<DiagnosticKind, string>> = {
  door: `${DOMAIN.BINARY_SENSOR}.`,
  alert: `${DOMAIN.SENSOR}.`,
  error: `${DOMAIN.SENSOR}.`,
};

/** FR-14: title / aria-label ceiling, and the ceiling of the code inside it. */
const TEXT_CAP = 200;
const CODE_CAP = 32;
const QUIET_STATES: readonly string[] = ['none', 'unavailable', 'unknown'];

/** FR-3: a config field counts only as a non-blank string, trimmed. */
export function configuredId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const id = raw.trim();
  return id === '' ? undefined : id;
}

/** FR-5: own-property lookup (Object.hasOwn semantics; the tsconfig lib predates ES2022), and only in the expected domain. */
export function readDiagnostic(
  states: Readonly<Record<string, HassEntity>>,
  id: string | undefined,
  domainPrefix: string,
): HassEntity | undefined {
  if (!id || !id.startsWith(domainPrefix) || !Object.prototype.hasOwnProperty.call(states, id)) return undefined;
  return states[id];
}

const normalized = (entity: { state: unknown }): string | undefined =>
  typeof entity.state === 'string' ? entity.state.trim() : undefined;

/** FR-5: the door is open only on `on`, any case and spacing. */
export function isDoorOpen(entity: { state: unknown }): boolean {
  return normalized(entity)?.toLowerCase() === 'on';
}

/** FR-5: an alert or an error is reported unless blank, none, unavailable or unknown. */
export function isReported(entity: { state: unknown }): boolean {
  const s = normalized(entity);
  return s !== undefined && s !== '' && !QUIET_STATES.includes(s.toLowerCase());
}

/** FR-7: a non-blank string (trimmed) or a finite number; anything else is no code. */
export function errorCode(raw: unknown): string | undefined {
  if (typeof raw === 'string') return raw.trim() === '' ? undefined : raw.trim();
  // Number.isFinite never coerces: it is true only for a finite number value.
  if (Number.isFinite(raw)) return String(raw);
  return undefined;
}

const sameAsCode = (label: string, code: string): boolean => label.trim().toLowerCase() === code.toLowerCase();

/** FR-7: `label (code)`, the code alone when the label is the untranslated code, the label without a code. */
export function errorText(label: string, code: string | undefined): string {
  if (code === undefined) return label;
  return sameAsCode(label, code) ? code : `${label} (${code})`;
}

/** FR-14: beyond 200 characters, the first 199 and an ellipsis. */
export function capText(text: string): string {
  return text.length > TEXT_CAP ? `${text.slice(0, TEXT_CAP - 1)}…` : text;
}

/** FR-14 (B-3): the label is cut, never the code, itself cut to 32 characters. */
export function capErrorText(label: string, code: string | undefined): string {
  const full = errorText(label, code);
  if (code === undefined || sameAsCode(label, code) || full.length <= TEXT_CAP) return capText(full);
  const suffix = ` (${code.slice(0, CODE_CAP)})`;
  if (label.length + suffix.length <= TEXT_CAP) return `${label}${suffix}`;
  return `${label.slice(0, TEXT_CAP - suffix.length - 1)}…${suffix}`;
}
