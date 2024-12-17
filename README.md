# ha-sci-fi
HA sci-fi cards for personal dashboard

## Available components
### Sci-Fi Hexa-Tiles card

**/!\ currently only design for Smartphone and tu be used with  HA single panel /!\\**

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
- Deal with tiles full screen (col + 2 row +3) + landascape
- When press key enter in chips component (editor mode) => save card action apply
