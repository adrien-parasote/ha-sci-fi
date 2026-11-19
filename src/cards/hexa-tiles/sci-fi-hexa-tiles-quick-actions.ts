/**
 * Quick actions of the hexa tiles: gestures (tap, hold, double tap), the
 * pending state that follows a toggle, and the per-state view of a tile.
 * Spec: docs/specs/hexa-tiles-quick-actions/spec.md (FR-3..FR-9).
 *
 * The card owns rendering; this module owns the timers and decides what a
 * gesture emits. The toggle itself is never coded here: a `hass-action` is
 * dispatched and the HA frontend calls the domain's service (FR-6).
 */

import { msg } from '@lit/localize';
import { fireHassAction } from '../../utils/action.js';
import type { ActionConfig } from '../../types/config.js';
import type { SciFiHexaTileConfig, SciFiHexaTileStateStyle } from './config.js';

/** Aligned on the HA frontend action handler (ledger F3). */
export const HOLD_MS = 500;
export const MOVE_TOLERANCE_PX = 10;
export const DOUBLE_TAP_MS = 250;

const DEFAULT_PENDING_S = 30;
/** Beyond 2^31-1 ms setTimeout fires at once: user durations are capped (anti-pattern 9). */
const MAX_PENDING_S = 86_400;

export type Gesture = 'tap' | 'hold' | 'double_tap';

/** FR-7.3: a finite number in ]0, 86400] seconds, anything else 30 s. */
export function resolvePendingTimeoutMs(value: unknown): number {
  // Number.isFinite is false for every non-number, so the cast below only ever sees a number.
  const seconds = Number.isFinite(value) ? (value as number) : Number.NaN;
  return (seconds > 0 && seconds <= MAX_PENDING_S ? seconds : DEFAULT_PENDING_S) * 1000;
}

export function isMoving(state: string | undefined): boolean {
  return state === 'opening' || state === 'closing';
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const nonEmptyString = (v: unknown): v is string => typeof v === 'string' && v !== '';

/**
 * FR-3 / FR-3.1: the entry of `states` strictly equal to `state`, keeping only
 * its non-empty string fields; a malformed map or entry reads as absent.
 */
export function resolveStateStyle(states: unknown, state: string): SciFiHexaTileStateStyle | undefined {
  if (!isPlainObject(states) || !Object.prototype.hasOwnProperty.call(states, state)) return undefined;
  const entry = states[state];
  if (!isPlainObject(entry)) return undefined;
  const style: { color?: string; icon?: string; label?: string } = {};
  for (const field of ['color', 'icon', 'label'] as const) {
    const v = entry[field];
    if (nonEmptyString(v)) style[field] = v;
  }
  return style;
}

/** What a tile shows, derived from its config, its entity state and the gesture state. */
export interface TileView {
  readonly error: boolean;
  /** The matching `states` entry, never set while in error (FR-3). */
  readonly entry?: SciFiHexaTileStateStyle;
  readonly pending: boolean;
  readonly noChange: boolean;
  /** Second line (FR-4); empty when there is none. */
  readonly subtitle: string;
  readonly ariaLabel: string;
}

export interface TileViewInput {
  readonly tile: SciFiHexaTileConfig;
  readonly name: string;
  /** A standalone tile with an entity — the only kind with states, error and pending. */
  readonly standalone: boolean;
  /** The entity state; undefined when the entity is absent from hass.states. */
  readonly state: string | undefined;
  readonly pending: boolean;
  readonly noChangeMark: boolean;
}

/** FR-3, FR-4, FR-5, FR-7, FR-7.3, FR-7.5, FR-7.7. */
export function describeTile(input: TileViewInput): TileView {
  const { tile, name, state } = input;
  const subtitle = nonEmptyString(tile.subtitle) ? tile.subtitle : '';
  if (!input.standalone) {
    return { error: false, pending: false, noChange: false, subtitle, ariaLabel: name };
  }
  const unavailable = state === undefined || state === 'unavailable';
  const error = unavailable || (nonEmptyString(tile.state_error) && state === tile.state_error);
  const entry = error || state === undefined ? undefined : resolveStateStyle(tile.states, state);
  const pending = input.pending || isMoving(state);
  const noChange = input.noChangeMark && !error && !pending;

  let ariaLabel = name;
  if (unavailable) ariaLabel = `${name}, ${msg('Unavailable')}`;
  else if (pending) ariaLabel = `${name}, ${msg('Pending')}`;
  else if (noChange) ariaLabel = `${name}, ${msg('No change')}`;
  else if (entry) ariaLabel = `${name}, ${entry.label ?? state}`;

  return {
    error,
    ...(entry ? { entry } : {}),
    pending,
    noChange,
    subtitle: unavailable ? msg('Unavailable') : (entry?.label ?? subtitle),
    ariaLabel,
  };
}

/** What the controller needs from the card. */
export interface QuickActionsHost {
  /** Dispatch target of `hass-action` (the card element). */
  readonly element: HTMLElement;
  /** State of an entity; undefined when absent from hass.states. */
  stateOf(entity: string): string | undefined;
  navigate(path: string): void;
  /** A tap or double tap muted by FR-5.1. */
  onMuted(tile: SciFiHexaTileConfig): void;
  /** A pending ended because the entity state changed (FR-7.2). */
  onPendingChanged(tile: SciFiHexaTileConfig): void;
  /** A pending reached its timeout unchanged (FR-7.3). */
  onNoChange(tile: SciFiHexaTileConfig): void;
  requestUpdate(): void;
}

interface Pending {
  readonly state: string | undefined;
  readonly tile: SciFiHexaTileConfig;
  readonly timer: ReturnType<typeof setTimeout>;
}

interface Hold {
  readonly timer: ReturnType<typeof setTimeout>;
  readonly x: number;
  readonly y: number;
}

const isActive = (a: ActionConfig | undefined | null): a is ActionConfig =>
  a !== undefined && a !== null && a.action !== 'none';

/** The entity a standalone tile drives, as the card reads it (`standalone !== false`). */
export function standaloneEntity(tile: SciFiHexaTileConfig): string | undefined {
  return tile.standalone !== false && tile.entity ? tile.entity : undefined;
}

export class HexaTileGestures {
  private readonly _pending = new Map<string, Pending>();
  /** Entities carrying the no-change mark, with the state the mark was set on. */
  private readonly _noChange = new Map<string, string | undefined>();
  private readonly _doubleTap = new Map<SciFiHexaTileConfig, ReturnType<typeof setTimeout>>();
  private _hold: Hold | undefined;
  /** FR-8.1: set by a hold, a pointercancel or a move; cleared by the next pointerdown. */
  private _ignoreNextClick = false;

  constructor(private readonly _host: QuickActionsHost) {}

  isPending(entity: string): boolean {
    return this._pending.has(entity);
  }

  hasNoChangeMark(entity: string): boolean {
    return this._noChange.has(entity);
  }

  // ─── Events (FR-6, FR-8, FR-8.1, FR-9) ─────────────────────────────────────

  onClick(tile: SciFiHexaTileConfig, e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (this._ignoreNextClick) {
      this._ignoreNextClick = false;
      return;
    }
    if (!isActive(tile.double_tap_action)) {
      this._perform(tile, 'tap');
      return;
    }
    const open = this._doubleTap.get(tile);
    if (open !== undefined) {
      clearTimeout(open);
      this._doubleTap.delete(tile);
      this._perform(tile, 'double_tap');
      return;
    }
    this._doubleTap.set(tile, setTimeout(() => {
      this._doubleTap.delete(tile);
      this._perform(tile, 'tap');
    }, DOUBLE_TAP_MS));
  }

  /** The keyboard taps at once, never opens a double-tap window, never reads the ignore flag. */
  onKeyDown(tile: SciFiHexaTileConfig, e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (e.repeat) return;
    this._perform(tile, 'tap');
  }

  onPointerDown(tile: SciFiHexaTileConfig, e: PointerEvent): void {
    this._ignoreNextClick = false;
    this._cancelHold();
    if (e.button !== 0) return;
    const timer = setTimeout(() => {
      this._hold = undefined;
      this._ignoreNextClick = true;
      this._perform(tile, 'hold');
    }, HOLD_MS);
    this._hold = { timer, x: e.clientX, y: e.clientY };
  }

  onPointerMove(e: PointerEvent): void {
    if (!this._hold) return;
    if (Math.hypot(e.clientX - this._hold.x, e.clientY - this._hold.y) > MOVE_TOLERANCE_PX) {
      this._cancelHold();
      this._ignoreNextClick = true;
    }
  }

  /** pointerup / pointerleave disarm the hold. */
  onPointerEnd(): void {
    this._cancelHold();
  }

  onPointerCancel(): void {
    this._cancelHold();
    this._ignoreNextClick = true;
  }

  onContextMenu(e: Event): void {
    e.preventDefault();
  }

  // ─── Pending (FR-7.2, FR-7.4) ──────────────────────────────────────────────

  /** On every hass assignment: a state change ends the pending without mark, and lifts a no-change mark. */
  onHass(): void {
    for (const [entity, p] of [...this._pending]) {
      if (this._host.stateOf(entity) === p.state) continue;
      clearTimeout(p.timer);
      this._pending.delete(entity);
      this._host.onPendingChanged(p.tile);
    }
    for (const [entity, state] of [...this._noChange]) {
      if (this._host.stateOf(entity) !== state) this._noChange.delete(entity);
    }
  }

  /** FR-7.4: cancels every timer and forgets pending, marks and the ignore flag, emitting nothing. */
  reset(): void {
    this._cancelHold();
    for (const p of this._pending.values()) clearTimeout(p.timer);
    for (const t of this._doubleTap.values()) clearTimeout(t);
    this._pending.clear();
    this._doubleTap.clear();
    this._noChange.clear();
    this._ignoreNextClick = false;
  }

  // ─── Emission ──────────────────────────────────────────────────────────────

  private _cancelHold(): void {
    if (this._hold) clearTimeout(this._hold.timer);
    this._hold = undefined;
  }

  /** FR-5.1 is evaluated here, at emission time — a deferred tap re-reads the state. */
  private _perform(tile: SciFiHexaTileConfig, gesture: Gesture): void {
    const entity = standaloneEntity(tile);
    const state = entity ? this._host.stateOf(entity) : undefined;
    if (entity && (state === undefined || state === 'unavailable')) {
      if (gesture !== 'hold') this._host.onMuted(tile);
      // A hold opens more-info on an unavailable entity, whatever its hold_action, and nothing on an absent one.
      else if (state === 'unavailable') this._emitMoreInfo(entity);
      return;
    }
    const action = this._emit(tile, gesture);
    if (action === 'toggle' && entity) this._startPending(entity, tile, state);
  }

  /** Emits the gesture's action and returns the resolved action name (FR-2, FR-8, FR-9). */
  private _emit(tile: SciFiHexaTileConfig, gesture: Gesture): string | undefined {
    if (gesture === 'double_tap') {
      fireHassAction(this._host.element, tile, 'double_tap');
      return tile.double_tap_action?.action;
    }
    if (gesture === 'hold' && tile.hold_action) {
      if (tile.hold_action.action === 'none') return undefined;
      fireHassAction(this._host.element, tile, 'hold');
      return tile.hold_action.action;
    }
    if (gesture === 'tap' && tile.tap_action) {
      fireHassAction(this._host.element, tile, 'tap');
      return tile.tap_action.action;
    }
    if (gesture === 'tap' && tile.link) {
      this._host.navigate(tile.link);
      return undefined;
    }
    if (tile.entity) return this._emitMoreInfo(tile.entity);
    return undefined;
  }

  private _emitMoreInfo(entity: string): string {
    fireHassAction(this._host.element, { entity, tap_action: { action: 'more-info' } }, 'tap');
    return 'more-info';
  }

  /** FR-7: enter — or re-enter — pending for the entity, with the emitting tile's timeout. */
  private _startPending(entity: string, tile: SciFiHexaTileConfig, state: string | undefined): void {
    if (isMoving(state)) return; // FR-7.5: the entity reports its motion itself
    const previous = this._pending.get(entity);
    if (previous) clearTimeout(previous.timer);
    this._noChange.delete(entity);
    const timer = setTimeout(() => {
      this._pending.delete(entity);
      this._noChange.set(entity, state);
      this._host.onNoChange(tile);
      this._host.requestUpdate();
    }, resolvePendingTimeoutMs(tile.pending_timeout));
    this._pending.set(entity, { state, tile, timer });
    this._host.requestUpdate();
  }
}
