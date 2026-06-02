# ADR-015: Dynamic Persons from hass.states

- **Status:** Accepted
- **Date:** 2026-06-01
- **Scope:** `sci-fi-bridge` card only

## Context

The CREW section needs to display which household members are home and where others are. Options: hardcode names, use template sensors, or read native HA `person.*` entities.

## Decision

The card reads all `person.*` entities listed in `config.persons` (YAML array). The state of each person entity contains the zone name (`home`, `work`, `school`, `not_home`, etc.).

## Rationale

- `hass.states['person.adrien'].state` = zone name (native HA).
- `entity_picture` = native HA avatar. No custom template needed.
- Adding a new person = one line in YAML config + adding them in HA.

## Consequences

- When a new person entity is added to HA and to the YAML config, they appear automatically in the card.
- No template sensors or helper entities required.
