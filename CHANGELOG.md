# Changelog

# [v0.5.4](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.4) - 2025-02-18

## 🆙  What's Changed

🌡️ Climate card
- Add friendly name display

🖼️ Sci-Fi icons
- Icons are now available even outside of sci-fi package

🦾 Technical
- Lighter package by removing mdi icon (now use from HA) from 3.3MB to 560KB
- Review package tree organization
- Add global card class & method
- Urbanize validated config method with metadata
- Upgrade modules import
- Upgrade customElement / customeCard method
- Create new component to make job easier in the future
- Rename files to match with HA frontend repository nomenclature
- Review card rendering by using new created components such as icons
- Display yaml config in edit mode for local tests

# [v0.5.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.3) - 2025-02-08

## 🐛 Fixes
- [Stove card - Change mode issue](https://github.com/adrien-parasote/ha-sci-fi/issues/29)

# [v0.5.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.2) - 2025-02-07

## 🆙  What's Changed

🪵🔥 Stove card
- Style review to better show lines displayed
- Disable temperature selection when stove is off
- Feature requests :
  - [Stove card - Add Time to service sensor](https://github.com/adrien-parasote/ha-sci-fi/issues/27)

🌡️ Climate card
- Review radiator style
- Replace `sun.sun` by `sensor.season` to show (if available) season icon on card header
- Add option to display or not global turn on/off button in card header (default is false)
- Feature requests :
  - [Climate card - Add set temperature Button](https://github.com/adrien-parasote/ha-sci-fi/issues/23)

🖼️ Sci-Fi icons
- Adding new icons 

# [v0.5.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.1) - 2025-02-04

## 🐛 Fixes
- [Stove card - Fuel circle is inversed](https://github.com/adrien-parasote/ha-sci-fi/issues/25)

# [v0.5.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.0) - 2025-02-04

## 🆕 What's New

**Vehicle Goes Supersonic**: adding stove card 🪵🔥

## 🆙  What's Changed

🌦️ Weather card
- Feature requests :
  - [Weather tile - Forecast improvement](https://github.com/adrien-parasote/ha-sci-fi/issues/14): `weather_hourly_forecast_limit` config parameter is not needed anymore.
  - [Weather card - First chart data rendering](https://github.com/adrien-parasote/ha-sci-fi/issues/20): new card optionnal parameter `chart_first_kind_to_render`, by default is equal to `temperature`.

🖼️ Sci-Fi icons
- Adding new icons 

## 🐛 Fixes
- [Climates card - CSS issue on big screen](https://github.com/adrien-parasote/ha-sci-fi/issues/16)
- [Lights card - Component height](https://github.com/adrien-parasote/ha-sci-fi/issues/22)
- [Weather card - SVG icons update](https://github.com/adrien-parasote/ha-sci-fi/issues/21)

<br>

# [v0.4.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.4.0) - 2025-01-25

## 🆕 What's New

**Liftoff** : adding 🌡️ climate card 🌡️ 

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

<br>

## [v0.3.5](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.3.5) - 2024-01-13

**Rocket Transported To Launchpad** : first package deployment under HACS

### Added or Changed

- Main Hexa card
- Ligth management card
- Weather info card