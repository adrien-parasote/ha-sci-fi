/**
 * Pellet cost amount of the sci-fi-stove card: the entity's state, two decimals at
 * HA's locale, then its unit. Pure; never throws on what `hass` hands it.
 * Spec: docs/specs/stove-pellet-cost/spec.md FR-4.1, FR-4.2.
 */

/** A unit longer than this is not a currency label and is dropped (FR-4.2). */
const MAX_UNIT_LENGTH = 8;
const FALLBACK_LANGUAGE = 'en';
const TWO_DECIMALS: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/** A malformed or non-string language falls back to 'en'. */
function numberFormat(language: unknown): Intl.NumberFormat {
  if (typeof language !== 'string' || language === '') return new Intl.NumberFormat(FALLBACK_LANGUAGE, TWO_DECIMALS);
  try {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#exceptions
    return new Intl.NumberFormat(language, TWO_DECIMALS);
  } catch (err) {
    if (!(err instanceof RangeError)) throw err;
    return new Intl.NumberFormat(FALLBACK_LANGUAGE, TWO_DECIMALS);
  }
}

/** The trimmed unit when it is a 1-to-8-character string, else undefined. */
function retainedUnit(unit: unknown): string | undefined {
  if (typeof unit !== 'string') return undefined;
  const trimmed = unit.trim();
  return trimmed.length >= 1 && trimmed.length <= MAX_UNIT_LENGTH ? trimmed : undefined;
}

export function formatPelletCost(value: number, unit: unknown, language: unknown): string {
  const amount = numberFormat(language).format(value === 0 ? 0 : value);
  const kept = retainedUnit(unit);
  return kept === undefined ? amount : `${amount} ${kept}`;
}
