# 🛸 HA SCI-FI 🛸

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs) 
[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#) 
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)

HA sci-fi is a group of cards to display simple and minimalist interface in HA dashboard.
The aim is to have your phone as a single entry point an use it as a remote house controler.

# 📚 Table of contents

1. 🛠️ [How to install ?](#how_to_install)
2. 🧩 [Available components](#available_components)
    * ⬡ [Sci-Fi Hexa-Tiles card](#hexa_tiles)
    * 💡 [Sci-Fi Lights card](#lights_card)
    * 🌦️ [Sci-Fi Weather card](#weather_card)
    * 🌡️ [Sci-Fi Climates card](#climates_card)
3. 🖼️ [Sci-Fi icon](#icon)

# 🛠️ How to install ?<a name="how_to_install"></a>

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

<br>

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Open top right menu by clicking on the 3 dots
4. Go to `Custom repositories`
5. Add the following repository adresse: `https://github.com/adrien-parasote/ha-sci-fi`, select `Dashboard` for type then click on `add` button.
4. Repository will be displayed in you HACS `Available for download` section
5. Open HACS package page, then click on `Download` button.
6. Let the last version selected and click on `Download` button.
5. Finally, tap `Reload` to end the process and start enjoying the package.

</details>

<br>

# 🧩 Available components <a name="available_components"></a>
## ⬡ Sci-Fi Hexa-Tiles card <a name="hexa_tiles"></a>

> [!CAUTION]
> Currently only design for Smartphone and to be used with HA single panel. **Improve/Known issues** > tiles are not yet responsive :'(

### Description:

Main package card, allowing you to have a single entities' vision you want. Then on tile's click, you're redirected to your dedicated HA dashboard page (example: a dashboard subview).<br>
Two modes are available: 

1. Kind (ex: light): parse you HA entities to give you a global state (ex: on - if at least one light is on - else off)
2. Standalone: display only 1 entity state

### Card features:

- Show current connected person with a custom optional welcome message
- Weather (optional) tile: special weather tile based on following entities:
    - `sun.sun` 
    - `weather.<my_city>`
- Custom tiles rendering status (standalone or kind)

> [!CAUTION]
> You need to have default Home Assistant `sun` service activated.

### Configuration

> [!TIP]
> This card can be configure through the UI that allow use to use HA interface for the configuration.

<details>

<summary>YAML</summary>

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
  weather_entity: weather.home  # replace with your weather providers's entity id
  link: weather_home  # replace with your weather page link
tiles:
  - standalone: false
    entity_kind: light
    entities_to_exclude: 
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
| type | string | **Required** | Card definition | `custom:sci-fi-hexa-tiles`|
| header_message | string| **Optionnal** | A message to display on top of the card | `''` |
| `weather` | Object | **Optional** | Section describing weather tile |  | 
| `tiles` | Object | **Optional** | list of custom tiles |  | 

**Example**
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
| weather_entity | String | **Required** (if weather.activate = true) | Your provider weather entity id  |  |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |

**Example**
```yaml
weather:
  activate: true
  weather_entity: weather.home  # replace with your weather providers's entity id
  link: weather_home  # replace with your weather page link
```
<br>

***`tiles` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| standalone | Boolean | **Required** | Define tile state rendering. <br> If `true`, tile's state will be based on entity state. <br> If `false`, tile's state will be displayed by parsing your HA entities  selected kind | `false` |

***Tiles[standalone=false] config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| entity_kind | String | **Required** | Entities' kind you want to track. Example : `light`, `person`, `sensor`... | |
| entities_to_exclude | List[String] | **Optional** | Entities' id list to exclude from tracking. Example: `light.excluded_light_1`, `light.excluded_light_2`  | `[]` |
| active_icon | String | **Required** | `mdi`/ `sci` icon to render when state is active. Example: `mdi:lightbulb-on-outline` | |
| inactive_icon | String | **Required** | `mdi`/ `sci` icon to render when state is active. Example: `mdi:lightbulb` | |
| name | String | **Optional** | Tile's name to display | |
| state_on | List[String] | **Required** | Active states value list to match. *Notice: all other states are consider as inactive* | |
| state_error | String | **Optional** | Error state value to match | |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |

**Example**
```yaml
tiles:
  - standalone: false
  entity_kind: light
  entities_to_exclude: 
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
| active_icon | String | **Required** | `mdi`/ `sci` icon to render when state is active. Example: `mdi:lightbulb-on-outline` | |
| inactive_icon | String | **Required** | `mdi`/ `sci` icon to render when state is active. Example: `mdi:lightbulb` | |
| name | String | **Optional** | Tile's name to display | |
| state_on | List[String] | **Required** | List of active states values to match. Notice: all other states are consider as inactive | |
| state_error | String | **Optional** | Error state value to match | |
| link | String | **Optional** | Link you want to follow when tile is tapped  | `''` |

**Example**
```yaml
tiles:
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

</details>

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_2.jpeg" width="300">

</details>


## 💡 Sci-Fi Lights card <a name="lights_card"></a>

### Description:

Lights package card, allowing you to dynamically manage your home lights by auto-discovering HA `light` entities.

### Card features:

Allow to deal with lights entities, grouping them per floors/areas.
- Display house global turn on / off lights button
- Display house's floors linked with lights entities
- Display per floor:
    - Global information 
        - Name
        - Number of lights on/off
    - Floor turn on/off lights button
    - Attached area with lights entities
- Display per area:
    - Area name
    - Area turn on/off lights button
    - Light entities button (turn on/off ligth)

> [!TIP]
> Floors & Areas icons are the one you define in `Areas, labels & zones` in your HA configuration

> [!NOTE]
> If Home Assistant `Sun` entity is available, day phase will be displayed on top of the card (dawn, dusk, day, rising, seting)

### Configuration

> [!TIP]
> This card can be configure through the UI that allow use to use HA interface for the configuration.


<details>

<summary>YAML</summary>

#### Minimal configuration

```yaml
type: custom:sci-fi-lights
```

#### Full configuration

```yaml
type: custom:sci-fi-lights
header: "Custom lights card header"
default_icon_on: mdi:lightbulb-on-outline
default_icon_off: mdi:lightbulb-outline
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
| type | string | **Required** | Card definition | `custom:sci-fi-lights` |
| header | string | **Optionnal** | Card header message | |
| default_icon_on | string | **Optionnal** | State on card icon | `mdi:lightbulb-on-outline`|
| default_icon_off | string | **Optionnal** | State off card icon | `mdi:lightbulb-outline`|
| first_floor_to_render | String | **Optional** | Floor you want to see when card is first rendered |  | 
| first_area_to_render | Object | **Optional** | Area from `first_floor_to_render` floor you want to see when card is first rendered |  | 

**Example**
```yaml
type: custom:sci-fi-lights
header: "Custom lights card header"
default_icon_on: mdi:lightbulb-on-outline
default_icon_off: mdi:lightbulb-outline
first_floor_to_render: floor_1 # replace with your prefered floor ID
first_area_to_render: area_1_floor_1 # replace with your prefered area ID from floor ID
custom_entities:
    - ... # see custom_entities configuration bellow
```

<br>

***`custom_entities` config***

Each `custom_entities` entries must be a light entity ID. Then for each, options are:

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| name | string | **Optionnal** | Custom name to display | `light.entity_id`|
| icon_on | string | **Optionnal** | Custom MID/SCI icon to display for entity state on | `config.default_icons.on`|
| icon_off | string | **Optionnal** | Custom MID/SCI icon to display for entity state off  | `config.default_icons.off`|

**Example**
```yaml
light.light_id_1: # The light entity ID you want to customize
  name: "Christmas tree"
  icon_on: mdi:pine-tree
  icon_off: mdi:pine-tree-variant-outline
```

</details>

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_2.jpeg" width="300">

</details>

## 🌦️ Sci-Fi Weather card <a name="weather_card"></a>

> [!CAUTION]
> Card is based on [MétéoFrance integration](https://www.home-assistant.io/integrations/meteo_france/)

> [!NOTE]
> Credits go to [basmilius](https://github.com/basmilius) for the awesome [weather icons](https://github.com/basmilius/weather-icons).

### Description:

Weather package card, display weather, alerts & forecast based on `Météo-France` & `sun.sun` entity & sensors.

> [!CAUTION]
> You need to have default Home Assistant `sun` service activated.

### Card features:

Card is composed of:
- A header, displaying current:
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
- A next day weather part used to select chart data day to display

### Configuration

> [!TIP]
> This card can be configure through the UI that allow use to use HA interface for the configuration.


<details>
<summary>YAML</summary>

#### Minimal configuration

```yaml
type: custom:sci-fi-weather
weather_entity: weather_home  # replace with your weather providers's entity id
```

#### Full configuration

```yaml
type: custom:sci-fi-weather
weather_entity: weather_home # replace with your weather providers's entity id
weather_daily_forecast_limit: 10
chart_first_kind_to_render: temperature
alert:
  state_green: green # replace with your alert green state
  state_yellow: yellow # replace with your alert yellow state
  state_orange: orange # replace with your alert orange state
  state_red: red # replace with your alert red state
  entity_id: sensor.weather_alert # replace with your weather alert providers's entity id
```

#### Options

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| type | string | **Required** | Card definition | `custom:sci-fi-weather`| 
| weather_entity | String | **Required** | Your provider weather entity id  |  |
| weather_daily_forecast_limit | Integer | **Optionnal** | Forecasted weather days between 0 and 15   | 10 |
| chart_first_kind_to_render | String | **Optionnal** | First data to display on the chart, can be : `temperature`, `precipitation` or `wind_speed` | temperature |
| `alert` | Object | **Optional** | Alert sensor config |  | 

**Example**
```yaml
type: custom:sci-fi-weather
weather_entity: weather_home # replace with your weather providers's entity id
weather_daily_forecast_limit: 10
chart_first_kind_to_render: temperature
alert:
   ... # see alert configuration bellow
```

<br>

***`alert` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| entity_id | string | **Required** | Weather alert sensor ID | |
| state_green | string | **Required** | Green state alert | |
| state_yellow | string | **Required** | Yellow state alert | |
| state_orange | string | **Required** | Orange state alert | |
| state_red | string | **Required** | Red state alert | |


**Example**
```yaml
alert:
  state_green: green # replace with your alert green state
  state_yellow: yellow # replace with your alert yellow state
  state_orange: orange # replace with your alert orange state
  state_red: red # replace with your alert red state
  entity_id: sensor.weather_alert # replace with your weather alert providers's entity id
```

</details>

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather_edit.jpeg" width="300">

</details>

## 🌡️ Sci-Fi Climates card <a name="climates_card"></a>

> [!CAUTION]
> Card is currently build for **climate[type] = radiator** only

### Description:

Climates package card, allowing you to dynamically manage your home climates by auto-discovering HA `climate` entities.

### Card features:

Allow to deal with climates entities, grouping them per floors/areas.
- Display average house temperature, global turn on (preset mode `eco`) / off (preset mode `frost_protection`)
- Display house's floors linked with climates entities
- Display per floor:
    - Global information 
        - Name
        - Average temperature
    - Attached area with climates entities
- Display per area:
    - Area name
    - Climate entities:
        - Current temperature
        - Current mode
        - Target temperature
        - Preset mode change button
        - HVAC change button

> [!TIP]
> Floors & Areas icons are the one you define in `Areas, labels & zones` in your HA configuration

> [!NOTE]
> If Home Assistant `Sun` entity is available, day phase will be displayed on top of the card (dawn, dusk, day, rising, seting)


### Configuration

> [!TIP]
> This card can be configure through the UI that allow use to use HA interface for the configuration.


<details>
<summary>YAML</summary>

#### Minimal configuration

```yaml
type: custom:sci-fi-climates
```

#### Full configuration

```yaml
type: custom:sci-fi-climates
header:
  icon_winter_state: mdi:thermometer-chevron-up
  message_winter_state: Winter is coming
  icon_summer_state: mdi:thermometer-chevron-down
  message_summer_state: Summer time
unit: "°C"
entities_to_exclude:
  - climate.excluded_1
state_icons:
  auto: sci:radiator-auto
  'off': sci:radiator-off
  heat: sci:radiator-heat
state_colors:
  auto: "#669cd2"
  'off': "#6c757d"
  heat: "#ff7f50"
mode_icons:
  frost_protection: mdi:snowflake
  eco: mdi:leaf
  comfort: mdi:sun-thermometer-outline
  comfort-1: mdi:sun-thermometer-outline
  comfort-2: mdi:sun-thermometer-outline
  boost: mdi:fire
mode_colors:
  frost_protection: "#acd5f3"
  eco: "#4fe38b"
  comfort: "#fdda0d"
  comfort-1: "#ffea00"
  comfort-2: "#ffff8f"
  boost: "#ff7f50"
```

#### Options

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| type | string | **Required** | Card definition | `custom:sci-fi-climates`| 
| `header` | Object | **Optionnal** | Header card options  |  |
| entities_to_exclude | List[String] | **Optional** | Entities' id list to exclude from tracking. Example: `climate.excluded_1`, `climate.excluded_1`  | `[]`|
| `state_icons` | Object | **Optionnal** | Icons for each climate states  |  |
| `state_colors` | Object | **Optionnal** | Color for each climate states  |  |
| `mode_icons` | Object | **Optionnal** | Icon for each climate preset mode  |  |
| `mode_colors` | Object | **Optionnal** | Color for each climate preset mode  |  |

**Example**
```yaml
type: custom:sci-fi-climates
header:
  ... # see header configuration bellow
unit: "°C"
entities_to_exclude:
  - climate.excluded_1
  - climate.excluded_2
state_icons:
  ... # see state_icons configuration bellow
state_colors:
  ... # see state_colors configuration bellow
mode_icons:
  ... # see mode_icons configuration bellow
mode_colors:
  ... # see mode_colors configuration bellow
```

<br>

***`header` config***

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| icon_winter_state | string | **Optional** | Icon to display when you're in a summer period and all our climates are in `frost_protection` mode | `mdi:thermometer-chevron-up` |
| message_winter_state | string | **Optional** | Message to display when you're in a summer period and all our climates are in `frost_protection` mode | Winter is coming |
| icon_summer_state | string | **Optional** | Icon to display when you're in a winter period and all our climates aren't in `frost_protection` mode | `mdi:thermometer-chevron-down` |
| message_summer_state | string | **Optional** | Icon to display when you're in a winter period and all our climates aren't in `frost_protection` mode | Summer time |


**Example**
```yaml
header:
  icon_winter_state: mdi:thermometer-chevron-up
  message_winter_state: Winter is coming
  icon_summer_state: mdi:thermometer-chevron-down
  message_summer_state: Summer time
```

<br>

***`state_icons` & `state_colors` config***

`state_icons` & `state_colors` have the same parameters, as follow

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| auto | string | **Optional** | Icon/Color to use when climate is in `auto` HVAC state | icon : `sci:radiator-auto` <br> color : `#669cd2` |
| off | string | **Optional** | Icon/Color to use when climate is in `off` HVAC state | icon : `sci:radiator-off` <br> color : `#6c757d` |
| heat | string | **Optional** | Icon/Color to use when climate is in `heat` HVAC state | icon : `sci:radiator-heat` <br> color : `#ff7f50` |

**Example**
```yaml
state_icons:
  auto: sci:radiator-auto
  'off': sci:radiator-off
  heat: sci:radiator-heat
state_colors:
  auto: "#669cd2"
  'off': "#6c757d"
  heat: "#ff7f50"
```

<br>

***`mode_icons` & `mode_colors` config***

`mode_icons` & `mode_colors` have the same parameters, as follow

| Name | Type | Requirement | Description | Default   |
| - | - | - | - | - |
| frost_protection | string | **Optional** | Icon/Color to use when climate preset mode is `frost_protection` | icon : `mdi:snowflake` <br> color : `#acd5f3` |
| eco | string | **Optional** | Icon/Color to use when climate preset mode is `eco` | icon : `mdi:leaf` <br> color : `#4fe38b` |
| comfort | string | **Optional** | Icon/Color to use when climate preset mode is `comfort` | icon : `mdi:sun-thermometer-outline` <br> color : `#fdda0d` |
| comfort-1 | string | **Optional** | Icon/Color to use when climate preset mode is `comfort-1` | icon : `mdi:sun-thermometer-outline` <br> color : `#ffea00` |
| comfort-2 | string | **Optional** | Icon/Color to use when climate preset mode is `comfort-2` | icon : `mdi:sun-thermometer-outline` <br> color : `#ffff8f` |
| boost | string | **Optional** | Icon/Color to use when climate preset mode is `boost` | icon : `mdi:fire` <br> color : `#ff7f50` |

**Example**
```yaml
mode_icons:
  frost_protection: mdi:snowflake
  eco: mdi:leaf
  comfort: mdi:sun-thermometer-outline
  comfort-1: mdi:sun-thermometer-outline
  comfort-2: mdi:sun-thermometer-outline
  boost: mdi:fire
mode_colors:
  frost_protection: "#acd5f3"
  eco: "#4fe38b"
  comfort: "#fdda0d"
  comfort-1: "#ffea00"
  comfort-2: "#ffff8f"
  boost: "#ff7f50"
```

</details>

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_3.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_edit_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_edit_3.jpeg" width="300">

</details>

<br>

# 🖼️ Sci-Fi icons <a name="icon"></a>

To complete HA icon set, sci-fi package onboard the following icons : 

> [!CAUTION]
> Icons can only be used with this package. It's currently not something use can use to customize other HA card.

| Name | HA string | Preview  |
| - | - | - |
| Radiator auto | sci:radiator-auto | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_auto.svg" alt="Radiator auto"  height="25"/> |
| Radiator frost protection | sci:radiator-frost-protection | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_frost_protection.svg" alt="Radiator frost protection"  height="25"/> |
| Radiator heat | sci:radiator-heat | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_heat.svg" alt="Radiator heat"  height="25"/> |
| Radiator off | sci:radiator-off | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_off.svg" alt="Radiator off"  height="25"/> |
| Sleeping vaccum | sci:vacuum-sleep | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/sleeping_vacuum.svg" alt="Sleeping vaccum"  height="25"/> |
| Stove | sci:stove | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove.svg" alt="Stove"  height="25"/> |
| Stove heat | sci:stove-heat | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_heat.svg" alt="Stove heat"  height="25"/> |
| Stove cool | sci:stove-cool | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_cool.svg" alt="Stove cool"  height="25"/> |

