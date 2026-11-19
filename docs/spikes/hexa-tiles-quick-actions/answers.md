# Spike answers — hexa-tiles-quick-actions

Played by the user on 2026-11-18 (`spike.html`, built blind by a fresh sub-agent). Answers given in chat, quoted or paraphrased faithfully.

## Answers

- **D1.1** (decision) colour during pending — no answer → kept as written (FR-7, FR-10).
- **D1.2** (dead end) a tap ignored during pending shows nothing — « on a un element toast dans notre code utilisons le pour pousser un msg a l'utilisateur (utilise i18n) » → superseded by D2.2 (no tap is ignored during pending any more); the toast becomes the card's feedback channel → FR-7.8 added.
- **D1.3** (dead end) a closing longer than the 30 s timeout — answer C « laisser comme décrit » → kept as written (30 s default, `pending_timeout` per tile, FR-7.3).
- **D2.1** (dead end) « sans effet » has no visible word — « utilise le toast pour communiquer » → FR-7.8 added (toast `<nom> : Sans effet` at the timeout), FR-7.3 amended.
- **D2.2** (dead end) 30 s without being able to tap again — « ma femme va pas attendre il faut qu'on puisse cliquer plusieurs fois. par exemple ouverture portail puis arret en pleins milieu car on veut juste faire passer un pieton ou un velo donc on rappuie sur le bouton pour stop le mouvement et on re re appuie pour fermer » → FR-7.1 amended (no lockout: every toggle gesture emits and restarts pending), FR-7.5 amended (moving no longer mutes), FR-7.6 amended (the user's decision), Assumption 9 added, anti-pattern 3 replaced.
- **D2.3** (decision) the mark lasts until the next state change or tap — no answer → kept as written (FR-7.3).
- **D3.1** (decision) « Unavailable » and « Open » share the red — no answer → kept as written (FR-5, distinction by the mark and the text).
- **D3.2** (dead end) a tap on an unavailable tile gives no feedback — « utilise le toast pour communiquer » → FR-5.1 amended, FR-7.8 (toast `<nom> : Indisponible`).
- **D4.1** (dead end) « Borne active » ≠ car charging — « quand la charge est active on a la prise active, et quand la charge est terminée la prise est inactive » → the switch IS the charge state; target config labels amended (`on` → `En charge`, `off` → `Charge terminée`), Non-Goal kept.
- **D4.2** (decision) the state label replaces the subtitle — no answer → kept as written (FR-4, Assumption 7).
- **D5.1** (decision) default tap = more-info — no answer → kept as written (FR-2).
- **D5.2 / D5.3** (dead ends) radiator / TV toggle and TV states — « oublie l'ajout de radiateur. pour la TV c'est soit on allume soit on eteind te prend pas la tete pour le moment » → radiator out of scope (Overview, Non-Goals amended); the TV is a plain on / off toggle tile, nothing specific to build → kept as written.
- **D6.1** (dead end) Live mode drives the real devices — answer C « laisser comme décrit » → kept as written (FR-16).
- **D6.2** (dead end) the EV charger absent from the mock — answer A « mock-data.js gagne switch.mureva_evlink (on) » → FR-16 amended, TC-HQA-U-17 amended.
- **D6.3** (dead end) one workbench scenario only — answer A « deux scénarios s'ajoutent : Indisponible et Portail en mouvement » → FR-16 amended, TC-HQA-U-17 amended.
