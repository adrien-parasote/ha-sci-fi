# ADR-011: Universal TV D-Pad Remote Mapping Architecture

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The TV Card includes a tactical D-pad (Up, Down, Left, Right, Select/OK) and supplementary control buttons (Home, Back, Menu). Different HA TV integrations support key presses differently:

1. **Sony Bravia / Apple TV**: Standard `remote.send_command` with actions (`Up`, `Down`, etc.).
2. **LG webOS**: Custom service `webostv.button` or custom key inputs.
3. **Android TV / Fire TV**: Custom service `androidtv.adb_command`.

Hardcoding commands for a single brand makes the card non-reusable. Forcing the user to define full custom tap actions for all 8 D-pad buttons creates massive, repetitive YAML configurations.

## Decision

Implement a **Hybrid Action Mapping Model**:

1. **Simple Default Configuration (Zero-YAML Remote Mode)**:
   The config accepts a `remote_entity` field (e.g. `remote.bravia_4k_vh22`). If provided, the D-pad automatically calls `remote.send_command` with uppercase button names: `UP`, `DOWN`, `LEFT`, `RIGHT`, `CONFIRM`, `BACK`, `HOME`, `MENU`.

2. **Full Lovelace Action Overrides (Power-User Mode)**:
   Every D-pad button can optionally accept a standard Lovelace `tap_action` block in YAML/editor. If a custom action is specified, it completely overrides the default remote command.

```yaml
type: custom:sci-fi-tv
entity: media_player.bravia_4k_vh22
remote_entity: remote.bravia_4k_vh22
# Override just the Home button:
home_action:
  action: call-service
  service: script.warp_speed_home
```

## Consequences

- Setting up the remote takes 1 line instead of ~40 lines of duplicate tap actions.
- LG webOS, Android TV, or custom script users can still map every key manually.
- The mock engine in the workbench can simulate both modes easily.
