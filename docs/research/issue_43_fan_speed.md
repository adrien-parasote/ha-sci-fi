## Research Results: Vacuum Fan Speed Selection

### Topic Decomposition
| # | Sub-Question | Why Necessary | Source Types |
|---|-------------|---------------|-------------|
| 1 | How are fan speeds exposed by the Home Assistant vacuum entity? | To know where to read the current speed and the list of available speeds | HA Official Docs, existing code |
| 2 | Which service modifies the fan speed? | To send the command when a speed is selected | HA Official Docs, existing code |
| 3 | What is the best Lovelace UI component for an icon-triggered dropdown menu? | To ensure native look-and-feel without external dependencies | HA Frontend source, existing HA custom cards |

### Source Evaluation
| Source | Type | Date | Credibility | Key Findings | Conflicts? |
|--------|------|------|-------------|-------------|------------|
| `sci-fi-vacuum.ts` | Existing Code | 2026 | High | The fan speeds are in `attributes.fan_speed_list` and current is `attributes.fan_speed`. The service is `vacuum.set_fan_speed`. Currently it iterates through the array cyclically. | No |
| HA Frontend component docs | Official Docs | 2026 | High | `<ha-button-menu>` or `<ha-md-button-menu>` are standard HA components to display a dropdown from an icon. They contain `<mwc-list-item>` for the options. | No |

### Gaps Identified
| Gap | Why It Matters | What Research Would Fill It |
|-----|---------------|---------------------------|
| Availability of `<ha-button-menu>` in the context of the custom card | If not available, the menu might not render. | Since HA exposes its elements globally to custom cards, it is universally available. |

### Recommendation
- **Chosen approach:** Adapt the current `<sf-icon>` inside the header to be wrapped by a native HA dropdown component or replace it with a click handler that opens a menu. However, to keep styling simple and consistent, we can use `<ha-button-menu>` with `<ha-icon-button>` as the trigger, and `<mwc-list-item>` for the speed options.
- **Justification:** `<ha-button-menu>` is a native HA component that perfectly matches the "select when click on icon" requirement, overlaying a native Material design menu.
- **Impact on spec:** The spec for `sci-fi-vacuum` must be updated to replace the simple `@click` cyclic progression with a dropdown menu displaying `fan_speed_list`.

### Discovered Patterns
- **Pattern:** Using `<ha-button-menu>` for inline icon menus.
```html
<ha-button-menu corner="BOTTOM_START">
  <ha-icon-button slot="trigger" .path=${mdiFan}></ha-icon-button>
  ${speeds.map(speed => html`
    <mwc-list-item value=${speed} ?selected=${speed === currentSpeed} @click=${this._setSpeed}>
      ${speed}
    </mwc-list-item>
  `)}
</ha-button-menu>
```
(Alternatively, we can bind `@click` on the list items directly and call `vacuum.set_fan_speed`).
