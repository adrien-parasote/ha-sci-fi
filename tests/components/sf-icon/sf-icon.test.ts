// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/components/sf-icon/sf-icon.js';
import type { SfIcon } from '../../../src/components/sf-icon/sf-icon.js';

describe('sf-icon', () => {
  it('renders a fallback icon for unknown namespaces', async () => {
    const el = document.createElement('sf-icon') as SfIcon;
    el.icon = 'unknown:icon';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    const path = el.querySelector('path')!;
    // Fallback path check
    expect(path.getAttribute('d')).to.include('M11.5,2C6.81,2');
  });

  it('renders custom icon if present in window.customIcons', async () => {
    window.customIcons = {
      sf: { custom: 'M10 10 H 90 V 90 H 10 L 10 10' },
    };
    const el = document.createElement('sf-icon') as SfIcon;
    el.icon = 'sf:custom';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    const path = el.querySelector('path')!;
    expect(path.getAttribute('d')).to.equal('M10 10 H 90 V 90 H 10 L 10 10');
  });
});
