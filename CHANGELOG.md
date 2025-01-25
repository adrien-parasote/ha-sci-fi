# Changelog

# [v0.4.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.4.0) - 2025-01-25

## 🆕 What's New

Adding 🌡️ climate card 🌡️ 

## 🆙  What's Changed

⬡ Hexa card
- Remove `sun.sun` entity from configuration: now a pre-requisite for the card
💡 Ligths management card
- Review card header:
   - Add global turn on/off lights for the entire house
   - Display sun state if `sun.sun` entity is available in HA
- Add toast on actions rendering error/success status
🌦️ Weather info card
 - Remove `sun.sun` entity from configuration: now a pre-requisite for the card
 - Limit forecast hours to 24 max. In future, card will follow this feature request [Weather tile - Forecast improvement](https://github.com/adrien-parasote/ha-sci-fi/issues/14)

## ❗Breaking change 

⬡ Hexa card
- Configuration changed for header message
   
 Old 
```yaml
header:
  message: 'Welcome'
```
New
```yaml
header_message: 'Welcome'
```

💡 Ligths management card
- Configuration changed for default icons
   
 Old 
```yaml
default_icons:
    'on': mdi:lightbulb-on-outline
    'off': mdi:lightbulb-outline
```
New
```yaml
default_icon_on: mdi:lightbulb-on-outline
default_icon_off: mdi:lightbulb-outline
```

## 🐛 Fixes 

- [Weather card chart rendering icon](https://github.com/adrien-parasote/ha-sci-fi/issues/11)


## [v0.3.5](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.3.5) - 2024-01-13

Rocket Transported To Launchpad : first package deployment under HACS

### Added or Changed

- Main Hexa card
- Ligth management card
- Weather info card