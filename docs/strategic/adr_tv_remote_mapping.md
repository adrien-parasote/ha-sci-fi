# ADR-011: Universal TV D-Pad Remote Mapping Architecture

- **Status**: Proposed (Pending Spec Verification)
- **Date**: 2026-05-29
- **Deciders**: Adrien Parasote, AI Assistant

---

## Context

The TV Card (Planet Orbit Exit) includes a tactical D-pad (Up, Down, Left, Right, Select/OK) and supplementary control buttons (Home, Back, Menu). 
Different Home Assistant TV integrations support key presses in different ways:
1. **Sony Bravia / Apple TV**: Standard `remote.send_command` with actions (`Up`, `Down`, etc.).
2. **LG webOS**: Custom service `webostv.button` or custom key inputs.
3. **Android TV / Fire TV**: Custom service `androidtv.adb_command`.

Hardcoding commands for a single brand (like Bravia) makes the card non-reusable. However, forcing the user to define full custom tap actions for all 8 D-pad buttons creates massive, repetitive YAML configurations.

---

## Decision

We will implement a **Hybrid Action Mapping Model**:

1. **Simple Default Configuration (Zero-YAML Remote Mode)**:
   The card configuration accepts a `remote_entity` field (e.g. `remote.bravia_4k_vh22`). If provided:
   * The D-pad automatically calls the `remote.send_command` service.
   * Button commands are mapped to uppercase strings: `UP`, `DOWN`, `LEFT`, `RIGHT`, `CONFIRM`, `BACK`, `HOME`, `MENU`.
   * These match the native Home Assistant remote command protocol.

2. **Full Lovelace Action Overrides (Power-User Mode)**:
   Every single button on the D-pad can optionally accept a standard Lovelace `tap_action` block in the YAML/editor.
   * Supports `call-service`, `navigate`, `more-info`, `none`.
   * If a custom action is specified for a button, it completely overrides the default remote commands.

```yaml
# Example YAML Configuration
type: custom:sci-fi-tv
entity: media_player.bravia_4k_vh22
remote_entity: remote.bravia_4k_vh22 # Default remote mode enabled!
# Overriding just the Home button for a custom script:
home_action:
  action: call-service
  service: script.warp_speed_home
```

---

## Consequences

* **Saves Time**: Setting up the remote takes 1 line of configuration instead of 40 lines of duplicate tap actions.
* **100% Flexible**: LG webOS, Android TV, or custom script users can still map every key manually.
* **Low Risk**: Simplifies standard Bravia setups while preserving compatibility.
* **Highly Testable**: The mock engine in the local Workbench can simulate both modes easily.
