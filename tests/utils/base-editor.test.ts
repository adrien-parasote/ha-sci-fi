// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';
import { html } from 'lit';

import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../src/utils/base-editor.js';

@customElement('mock-editor')
class MockEditor extends SciFiBaseEditor {
  protected override renderEditor() {
    return html`<div>Mock Editor</div>`;
  }
}

describe('base-editor', () => {
  it('initializes default config properties', async () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    expect((el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */.config).to.be.undefined;
    el.setConfig({ type: 'custom:mock' });
    expect((el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */.config).to.deep.equal({ type: 'custom:mock' });
  });

  it('dispatches config-changed event on change', async () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    el.setConfig({ type: 'custom:mock' });

    let eventFired = false;
    let detailConfig: any = null;

    el.addEventListener('config-changed', (e: any) => {
      eventFired = true;
      detailConfig = e.detail.config;
    });

    (el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */._dispatchConfigChanged({ type: 'custom:mock', title: 'New' });

    expect(eventFired).to.be.true;
    expect(detailConfig.title).to.equal('New');
  });
});
