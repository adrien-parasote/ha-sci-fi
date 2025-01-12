# 🛸 HA SCI-FI 🛸

[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#) 
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)

HA sci-fi is a group of cards to display simple and minimalist interface in HA dashboard.
The aim is to have your phone as a single entry point an use it as a remote house controler.

# Table of contents

1. [How to install ?](#how_to_install)
2. [Available components](#available_components)
    1. [Sci-Fi Hexa-Tiles card](#hexa_tiles)
    2. [Sci-Fi Lights card](#lights_card)
    3. [Sci-Fi Weather card](#weather_card)

# How to install ?<a name="how_to_install"></a>

<details>

<summary>Without HACS</summary>

<br>

1. Download the following file: [sci-fi.min.js](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/dist/sci-fi.min.js)
2. Add it to your `<config>/www` folder
3. On your dashboard click on the icon at the right top corner then on `Edit dashboard`
4. Click again on that icon and then click on `Manage resources`
5. Click again on that icon and then click on `Resources`
6. Click on `Add resource`
7. Copy and paste this: `/local/sci-fi.min.js?v=1`
8. Click on `JavaScript Module` then `Create`
9. Go back and refresh your page
10. You can now click on `Add card` in the bottom right corner and search for `Sci-fi card`
11. After any update of the file you will have to edit `/local/bubble-card.js?v=1` and change the version to any higher number

If it's not working, just try to clear your browser cache.`

</details>

<details>

<summary>With HACS (Recommended)</summary>

Coming soon

</details>


# Available components <a name="available_components"></a>
## Sci-Fi Hexa-Tiles card <a name="hexa_tiles"></a>

> [!CAUTION]
> Currently only design for Smartphone and to be used with HA single panel. **Improve/Known issues** > tiles are not yes responsive :'(

### Description:

Main package card, allowing you to have a single vision of entities you want to know, then on tile's click go to your dedicated page.<br>
Two modes are available: 

1. Standalone: display only 1 entity state
2. Kind (ex: light): parse you HA entities to give you a global state (ex: on - if at least one light is on - else off)

### Card features:

- Show current connected person with a custom welcome message
- Weather (optional) tile: special weather tile based on 
    - `sun.sun` 
    - `weather.<my_city>`
- Custom tiles rendering status (standalone or kind)

### Configuration

> [!TIP]
> This card can be configure through a UI that allow use to use HA interface for the configuration.

#### Minimal configuration

```yaml
type: custom:sci-fi-hexa-tiles
```

#### Full configuration

```yaml
type: custom:sci-fi-hexa-tiles
header_message: Hey, welcome back Bro !
weather:
  activate: true
  sun_entity: sun.sun
  weather_entity: weather.home  # replace with your weather providers's entity id
  link: weather_home  # replace with your weather page link
tiles:
  - standalone: false
    entity_kind: light
    entity_to_exclude: 
        - light.excluded_light_1  # replace with your light entity
        - light.excluded_light_2  # replace with your light entity
    active_icon: mdi:lightbulb-on-outline
    inactive_icon: mdi:lightbulb
    name: Lights
    state_on:
      - "on"
    state_error: ""
    link: lights_home # replace with your light page link
  - standalone: true
    active_icon: mdi:robot-vacuum
    inactive_icon: sci:vacuum-sleep
    name: Dobby
    state_on: # replace with your custom states
      - cleaning
      - returning
    state_error: error
    link: Vacuum_home # replace with your vaccum page link
    entity: vacuum.dobby
```

#### Options

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| type | string | **Required** | `custom:sci-fi-hexa-tiles`| |
| header_message | string| **Optionnal** | A message to display on top of the card | `''` |
| `weather` | Object | **Optional** | Section describing weather tile |  | 
| `tiles` | Object | **Optional** | list of custom tiles |  | 

```yaml
type: custom:sci-fi-hexa-tiles
header_message: Hey, welcome back Bro !
weather:
    - ... # see weather configuration bellow
tiles:
    - ... # see tiles configuration bellow
```

<br>

***`weather` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| activate | Boolean | **Optional** | Flag to activate or not weather special tiles | `false` |
| sun_entity | String | **Required** (if weather.activate = true) | HA `sun entity`  | `sun.sun` |
| weather_entity | String | **Required** (if weather.activate = true) | Your provider weather entity id  |  |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |
| `tiles` | Object | **Optional** | list of custom tiles |  | 

**Example**
```yaml
weather:
  activate: true
  sun_entity: sun.sun
  weather_entity: weather.home  # replace with your weather providers's entity id
  link: weather_home  # replace with your weather page link
```
<br>

***`tiles` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| standalone | Boolean | **Required** | Define tile state rendering. <br> If `true`, tile's state will be based on entity state. <br> If `false`, tile's state will be displayed by parsing your HA entities `kind` | `false` |

```yaml
tiles:
  - ... # see tile configuration bellow
  - ... # see tile configuration bellow
  - ... # see tile configuration bellow
```

***Tiles[standalone=false] config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| entity_kind | String | **Required** | Entities' kind you want to track. Example : `light`, `input_button`, `person`, `sensor`... | |
| entity_to_exclude | List[String] | **Optional** | Entities's id list to exclude from tracking. Example: `light.excluded_light_1`, `light.excluded_light_2`  | |
| active_icon | String | **Required** | MDI/SCI icon to render when state is active. Example: `mdi:lightbulb-on-outline` | |
| inactive_icon | String | **Required** | MDI/SCI icon to render when state is active. Example: `mdi:lightbulb` | |
| name | String | **Optional** | Tile's name to display | |
| state_on | List[String] | **Required** | List of active states values to match. Notice: all other states are consider as inactive | |
| state_error | String | **Optional** | Error state value to match | |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |

```yaml
- standalone: false
entity_kind: light
entity_to_exclude: 
    - light.excluded_light_1  # replace with your light entity
    - light.excluded_light_2  # replace with your light entity
active_icon: mdi:lightbulb-on-outline
inactive_icon: mdi:lightbulb
name: Lights
state_on:
    - "on"
state_error: ""
link: lights # replace with your light page link
```

***Tiles[standalone=true] config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| entity | String | **Require** | Your standalone entity id  |  |
| active_icon | String | **Required** | MDI/SCI icon to render when state is active. Example: `mdi:lightbulb-on-outline` | |
| inactive_icon | String | **Required** | MDI/SCI icon to render when state is active. Example: `mdi:lightbulb` | |
| name | String | **Optional** | Tile's name to display | |
| state_on | List[String] | **Required** | List of active states values to match. Notice: all other states are consider as inactive | |
| state_error | String | **Optional** | Error state value to match | |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |


```yaml
- standalone: true
active_icon: mdi:robot-vacuum
inactive_icon: sci:vacuum-sleep
name: Dobby
state_on: # replace with your custom states
    - cleaning
    - returning
state_error: error
link: Vacuum_home # replace with your vaccum page link
entity: vacuum.dobby
```

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_2.jpeg" width="300">

</details>

## Sci-Fi Lights card <a name="lights_card"></a>

### Description:

Lights package card, allowing you to dynamically manage your home lights by auto-discovering HA `light` entities.

### Card features:

Allow to deal with lights entities, grouping them per floors/areas.
- Display house's floors linked with lights entities
- Display per floor:
    - Global information 
        - name
        - level
        - number of lights on/off
    - Global turn on/off light button
    - Attached area with lights entities (areas' icon are from HA area definition)
- Display per area:
    - Area name
    - Global turn on/off light button
    - Light entities button

> [!TIP]
> Floors & Areas icons are the one you define in HA `Areas, labels & zones`

### Configuration

> [!TIP]
> This card can be configure through a UI that allow use to use HA interface for the configuration.

#### Minimal configuration

```yaml
type: custom:sci-fi-lights
```

#### Full configuration

```yaml
type: custom:sci-fi-lights
default_icons:
  on: mdi:lightbulb-on-outline
  off: mdi:lightbulb-outline
first_floor_to_render: floor_1 # replace with your prefered floor ID
first_area_to_render: area_1_floor_1 # replace with your prefered area ID from floor ID
custom_entities:
  light.light_id_1:
    name: "Christmas tree"
    icon_on: mdi:pine-tree
    icon_off: mdi:pine-tree-variant-outline
  light.light_id_2:
    name: "Desk lamp"
    icon_on: mdi:desk-lamp-on
    icon_off: mdi:desk-lamp
```

#### Options

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| type | string | **Required** | `custom:sci-fi-lights`| |
| `default_icons` | Object | **Optional** | Define default icon represening lights' state for the card |  | 
| first_floor_to_render | String | **Optional** | Floor you want to see when card is first rendered |  | 
| first_area_to_render | Object | **Optional** | Area from `first_floor_to_render` you want to see when card is first rendered |  | 

```yaml
type: custom:sci-fi-lights
first_floor_to_render: floor_1 # replace with your prefered floor ID
first_area_to_render: area_1_floor_1 # replace with your prefered area ID from floor ID
default_icons:
    - ... # see default_icons configuration bellow
custom_entities:
    - ... # see custom_entities configuration bellow
```

<br>

***`default_icons` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| on | string | **Optionnal** | State on card icon | `mdi:lightbulb-on-outline`|
| off | string | **Optionnal** | State off card icon | `mdi:lightbulb-outline`|


```yaml
default_icons:
  on: mdi:lightbulb-on-outline
  off: mdi:lightbulb-outline
```

<br>

***`custom_entities` config***

Each `custom_entities` entries must be a light entity ID. Then for each, options are:

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| name | string | **Optionnal** | Custom name to display | `light.entity_id`|
| icon_on | string | **Optionnal** | Custom MID/SCI icon to display for entity state on | `config.default_icons.on`|
| icon_off | string | **Optionnal** | Custom MID/SCI icon to display for entity state off  | `config.default_icons.off`|

```yaml
light.light_id_1:
  name: "Christmas tree"
  icon_on: mdi:pine-tree
  icon_off: mdi:pine-tree-variant-outline
```

<br>

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_2.jpeg" width="300">

</details>

## Sci-Fi Weather card <a name="weather_card"></a>

Display current weather base on *weather entity* (Design for [MétéoFrance](https://www.home-assistant.io/integrations/meteo_france/) integration entity)

**/!\ currently only design for Smartphone and to be used with HA single panel /!\\**

**/!\ Card render is base on [MétéoFrance integration](https://www.home-assistant.io/integrations/meteo_france/) /!\\**

Credits go to [basmilius](https://github.com/basmilius) for the awesome [weather icons](https://github.com/basmilius/weather-icons).

### Content:
- Card is composed of 
    - A header:
        - weather state
        - temperature
        - hour/date
    - An optionnal alert section (if alert sensor if configured)
    - A daily weather summary:
        - cloud coverage
        - precipitation volume
        - rain luck
        - freeze luck
        - snow luck
    - A chart area, displaying next hourly:
        - temperatures
        - precipitations
        - wind speed
    - A next day weather part

### Available customization:
- Sun & Weather entity selection
- Number of next days/hours to display on the card
- Alert part : 
    - Alert sensor entity
    - Green, yellow, amber & red states values return by the sensor

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather_edit.jpeg" width="300">

</details>
