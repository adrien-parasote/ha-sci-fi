# 📺 TV Remote card

**`custom:sci-fi-tv`** — Futuristic TV remote control card featuring a concentric radar volume dial, central orbiting satellite, cyber-deck D-pad, and quick source select honeycomb grid.

---

## Features

- **Concentric Radar Telemetry dial layout** using sleek glowing arcs and subtle inner tick lines.
- **Tactical D-pad remote controller cross grid** styled in dark high-contrast panels with custom cyber-deck labels.
- **Honeycomb hexagon quick-source selection grid** that fits compactly under the central remote display.
- **3D Depth Orbiting Satellite**: A hardware-accelerated CSS keyframe-animated satellite that revolves around the central planet with realistic visibility occlusion when passing behind it.
- **Offline Standby Panel styling** displaying active Warp warning colors and caution banners when the TV is `off` or `unavailable`.
- **Intelligent Telemetry Parsing**: Automatically displays media title or source, with graceful fallback to Android TV/Bravia DRM package names (`app_name`, `app_id`) when media metadata is restricted (e.g. Netflix).
- **Tested on Sony Bravia**: Fully tested and validated with a Sony Bravia TV using the official Sony integration. Maps D-pad navigation keys to default Home Assistant remote command strings or accepts custom Lovelace `tap_action` configurations per button.

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_3.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_edit.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_edit1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/tv_edit2.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-tv
entity: media_player.bravia_4k_vh22
```

### Full

```yaml
type: custom:sci-fi-tv
entity: media_player.bravia_4k_vh22
remote_entity: remote.bravia_4k_vh22
name: "PLANET ORBIT EXIT"
sources:
  - name: "Netflix"
    action: call-service
    service: media_player.play_media
    service_data:
      entity_id: media_player.bravia_4k_vh22
      media_content_id: "com.netflix.ninja"
      media_content_type: "app"
  - HDMI 1
custom_actions:
  confirm:
    action: call-service
    service: script.my_custom_confirm_script
  volume_mute:
    action: call-service
    service: media_player.volume_mute
    service_data:
      entity_id: media_player.bravia_4k_vh22
      is_volume_muted: false
```

---

## Options

### Options — root

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-tv` | |
| `entity` | String | ✅ | Target `media_player` entity ID | |
| `remote_entity` | String | | Target `remote` entity ID for sending D-pad commands | |
| `name` | String | | Card display name | |
| `sources` | List\<String \| Object\> | | Quick-select media sources list | `[]` |
| `volume_entity` | String | | Dedicated `media_player` entity for volume control (if different from `entity`) | |
| `app_entity` | String | | Entity used for app/source metadata display | |
| `custom_actions` | Object | | D-pad button action overrides | |

### Options — `custom_actions` (per entry)

Each key can be one of the following buttons: `up`, `down`, `left`, `right`, `confirm`, `back`, `home`, `menu`, `power`, `info`, `enter`, `volume_mute`.

Values must conform to standard Lovelace action configurations:

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | String | ✅ | Lovelace action to execute (`call-service`, `navigate`, etc.) |
| `service` | String | | Service to call (for `call-service`) |
| `service_data` | Object | | Service parameters (for `call-service`) |
| `navigation_path` | String | | Path to navigate to (for `navigate`) |
