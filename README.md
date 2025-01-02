# 🛸 ha-sci-fi 🛸
HA sci-fi cards for personal dashboard

## Available components
### 1. Sci-Fi Hexa-Tiles card

**/!\ currently only design for Smartphone and to be used with HA single panel /!\\**

**Screenshot**

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">

**Content:**
- Show current connected person
- Display tiles rendering status :
    - Weather (optional): special weather tile based on 
        - sun.sun 
        - weather.*<my_city>*
    - Entity/Entities:
        - Standalone entity (ex: light.*<my_light>*)
        - Kind (ex: light) : entities provide by HA (in that case all light.* entities)

Available customization:
- Entity to exclude (in case of *"kind"* mode selected)
- Icons : active & inactive
- Tiles name
- Active entity state (ex: *"on"* for light)
- Error state (optional)
- Link : a link to follow when 

**Improve/Known issues**
- Responsive tiles (not only for smartphone)
- When press key enter in chips component (editor mode) => save card action apply


### 2. Sci-Fi Lights card

**/!\ currently only design for Smartphone and to be used with HA single panel /!\\**

**Screenshot**

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights.jpeg" width="300">

**Content:**
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

Available customization:
- Default on/off light icon (used to represente each entity card if not overwirted)
- First floor and associated area to display (if not setup, first floor and associated area in alphabetical order)
- Light entity :
    - Custom name : a custom name attached to the entity on the card
    - Custom active/inactive icon : icon rendered when light state is on/off

## How to install ?

TODO