# 🛸 HA SCI-FI 🛸
HA sci-fi cards for personal dashboard

# Table of contents
1. [Available components](#available_components)
    1. [Sci-Fi Hexa-Tiles card](#hexa_tiles)
    2. [Sci-Fi Lights card](#lights_card)
    3. [Sci-Fi Weather card](#weather_card)
2. [How to install ?](#how_to_install)

# Available components <a name="available_components"></a>
## Sci-Fi Hexa-Tiles card <a name="hexa_tiles"></a>

**/!\ currently only design for Smartphone and to be used with HA single panel /!\\**

### Content:
- Show current connected person
- Display tiles rendering status :
    - Weather (optional): special weather tile based on 
        - sun.sun 
        - weather.*<my_city>*
    - Entity/Entities:
        - Standalone entity (ex: light.*<my_light>*)
        - Kind (ex: light) : entities provide by HA (in that case all light.* entities)

### Available customization:
- Entity to exclude (in case of *"kind"* mode selected)
- Icons : active & inactive
- Tiles name
- Active entity state (ex: *"on"* for light)
- Error state (optional)
- Link : a link to follow when 

### Improve/Known issues
- Responsive tiles (not only for smartphone)
- When press key enter in chips component (editor mode) => save card action apply

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_2.jpeg" width="300">

</details>

## Sci-Fi Lights card <a name="lights_card"></a>

Allow to deal with lights entities, grouping them per floors/areas.

**/!\ currently only design for Smartphone and to be used with HA single panel /!\\**

### Content:
- Display house's floors with lights entities (floors' icon are from HA floor )
- Display per floor :
    - Global information 
        - name
        - level
        - number of lights on/off
    - Global turn on/off light button
    - Attached area with lights entities (areas' icon are from HA area definition)
- Display per area :
    - Area name
    - Global turn on/off light button
    - Light entities button

### Available customization:
- Default on/off light icon (used to represente each entity card if not overwrote)
- First floor and associated area to display (if not setup, first floor and associated area in alphabetical order)
- Light entity :
    - Custom name : a custom name attached to the entity on the card
    - Custom active/inactive icon : icon rendered when light state is on/off

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

# How to install ?<a name="how_to_install"></a>

TODO