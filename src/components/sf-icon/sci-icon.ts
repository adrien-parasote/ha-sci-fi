/**
 * <sci-icon> — public-facing sci-fi icon element.
 *
 * A subclass of <sf-icon> under the stable public tag name `sci-icon`; it only
 * changes the svg class and the log prefix, so every behaviour (lookup, loading
 * state, light DOM) lives in SfIcon.
 *
 *   <sci-icon icon="sci:stove"></sci-icon>
 *   <sci-icon icon="mdi:home"></sci-icon>
 *
 * Sizing and coloring via CSS custom properties:
 *   --icon-width  (default: 24px)
 *   --icon-height (default: 24px)
 *   --icon-color  (default: currentColor)
 */

import { customElement } from 'lit/decorators.js';
import { SfIcon } from './sf-icon.js';

@customElement('sci-icon')
export class SciIcon extends SfIcon {
  protected override get iconClass(): string {
    return 'sci-icon';
  }

  protected override get logPrefix(): string {
    return '[sci-icon]';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-icon': SciIcon;
  }
}
