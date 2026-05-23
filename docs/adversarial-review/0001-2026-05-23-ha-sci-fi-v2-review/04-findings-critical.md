# Critical Findings

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026

Only findings where there is ≥ 80% confidence that an AI coder would generate incorrect code that would cause runtime failures or deployment issues are classified as CRITICAL.

---

## [CRITICAL] — Dynamic MDI Icon Fetch Fallback Deficiency (Offline HA Support)

- **Location**: `docs/specs/04_components.md` § Error Handling (Line 102) & § Anti-Patterns (Line 75)
- **Problem**: 
  The specification details that `<sf-icon>` must check the `idb-keyval` cache first, and fetch native MDI icons on cache misses. However, the spec **never defines the source URL/endpoint** from which the MDI icon SVGs should be fetched. 
  An AI coder will naturally generate code that either:
  1. Guesses and hardcodes a public third-party CDN URL (e.g., `https://unpkg.com/@mdi/svg@7.2.96/svg/${name}.svg` or `https://cdn.jsdelivr.net/npm/@mdi/svg/...`), which **fails completely** on local/offline Home Assistant instances (a standard configuration for smart-home environments aiming for high privacy and local autonomy).
  2. Attempt to query HA's internal REST API endpoints without a valid authentication token, resulting in `401 Unauthorized` errors.
  
- **Concrete Code Impact**:
  Dynamic fetches will trigger uncaught network exceptions on offline setups, rendering empty blank boxes for all custom elements that rely on `<sf-icon>` for state indicators.
  
- **Fix**:
  Explicitly specify the fetch fallback behavior in `docs/specs/04_components.md` to utilize Home Assistant's local API and built-in icon registries where possible, or fall back to an explicit, local assets path shipped inside the HACS custom card resource directory itself.
  
  ```markdown
  ### Dynamic Icon Loading Contract (Update to Spec 04 §4.4)
  If the icon requested exists under the native `mdi:` namespace, `<sf-icon>` must attempt to query the native Home Assistant icon registry (`hass.connection.sendMessagePromise({type: "frontend/get_icons", category: "mdi"})`) or utilize the browser-cached HA frontend icons rather than performing external HTTP requests.
  If an HTTP fetch is required for custom assets, it must be requested from the relative path of the local custom card folder (`/hacsfiles/ha-sci-fi/icons/...`) rather than external CDNs, ensuring absolute offline support.
  ```
