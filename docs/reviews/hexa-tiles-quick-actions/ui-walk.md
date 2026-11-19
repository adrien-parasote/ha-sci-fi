# UI walk — hexa-tiles-quick-actions

33 requirement(s) of this lot walked on the running product by sonnet, a session that never saw the code: 30 held, 0 broken, 0 untestable, 3 shown on no screen (0.24 $).

A BROKEN you fix needs no word here: walk again, and it moves under « Fixed since an earlier walk ». A BROKEN you do NOT fix carries its RESOLUTION — `filed <bead>` when it is outside this lot's diff, `not a defect — <why>` when the walker is wrong. A walk rewrites this file and keeps the resolutions already written.

## Fixed since an earlier walk

- FR-7.2 — was BROKEN: In the workbench Mock mode the 3 s delayed mutation (in place, same state objects) never ends the wait: the tile stays pending on the old render until the timeout. A hass with fresh entity objects (as HA sends) ends it correctly.
- FR-16 — was BROKEN: In Mock mode the deferred state mutation is never applied: after a tap on the gate the service call is logged but cover.portail stays closed and the tile stays pending until the 30 s timeout. A pageerror 'sf-icon has already been used with this registry' was also seen at load.

## Held

IA-EX-1, IA-EX-2, IA-EX-3, IA-EX-4, IA-EX-5, IA-EX-6, FR-2, FR-3, FR-3.1, FR-4, FR-5, FR-5.1, FR-6, FR-7, FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6, FR-7.7, FR-7.8, FR-8, FR-8.1, FR-9, FR-10, FR-11, FR-12, FR-13, FR-16

## Shown on no screen

Not walked: nothing here says these hold — the tests and the code review answer for them.

FR-1, FR-14, FR-15
