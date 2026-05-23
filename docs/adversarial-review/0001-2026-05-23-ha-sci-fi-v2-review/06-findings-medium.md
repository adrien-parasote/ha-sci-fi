# Medium-Severity Findings

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026

Medium-severity findings represent minor architectural risks, bundle overheads, or subtle API-level edge cases that do not prevent build or runtime execution but could lead to performance degradation.

---

## 1. [MEDIUM] — Zod Bundle Size Overhead Risk

- **Location**: `docs/specs/02_domain_selectors.md` § Error Handling (Line 103) & § Blueprint Coverage (Line 14)
- **Problem**: 
  The specification mentions utilizing Zod for validating YAML card configs at runtime. While Zod provides great declarative validation, it is a heavy dependency (~45KB minified/gzipped) that would significantly inflate the custom card bundle size. One of our core strategic targets is keeping the bundle file size under ~100KB for rapid dashboard loading.
  
- **Concrete Code Impact**:
  Bundling Zod will increase the standalone single-file size to ~150KB+, causing a measurable lag in dashboard loading times on tablets and mobile screens.
  
- **Fix**:
  Replace Zod validation with standard lightweight custom TypeScript assert/type-guards, or use a micro-validator (like a custom 10-line helper) to perform configuration parsing.
  
  ```markdown
  ### Lightweight Configuration Validation (Update to Spec 02 §2.4)
  Card configurations must be validated using custom TypeScript type guards and simple assertions (`if (typeof config.entity_id !== 'string') ...`) rather than bundling Zod schemas, keeping the single IIFE bundle size under 80KB.
  ```

---

## 2. [MEDIUM] — Omission of super.willUpdate in Card Subclasses

- **Location**: `docs/specs/03_base_classes.md` § Assumptions (Line 42) & § Test Cases (Line 88)
- **Problem**: 
  `SciFiBaseCard` uses `willUpdate()` to reactively trigger `syncHALocale` when Home Assistant state variables update. If a card subclass overrides `willUpdate()` to perform local state computations but neglects to invoke `super.willUpdate(changedProperties)`, the parent class's locale sync mechanism will be bypassed completely.
  
- **Concrete Code Impact**:
  Overriding card components will fail to update their translated texts reactively when the Home Assistant language settings change.
  
- **Fix**:
  Add an explicit requirement in the subclass coding standards requiring all overrides to call their super method.
  
  ```markdown
  ### Base Class Lifecycle Contract (Update to Spec 03 §3.3)
  Any subclass that overrides standard Lit lifecycle methods (`willUpdate`, `updated`, `firstUpdated`) MUST invoke its parent implementation (`super.willUpdate(changedProperties)`) as the very first line of the block.
  ```

---

## 3. [MEDIUM] — IndexDB Incognito Mode Diagnostic Fallback

- **Location**: `docs/specs/04_components.md` § Error Handling (Line 103)
- **Problem**: 
  The icon cache uses `idb-keyval` to store retrieved MDI icons. In private/incognito browser windows, IndexedDB operations are often completely blocked. Although the spec mentions a fallback ("fetch on every render"), it lacks a diagnostic warning or rate limiter to prevent massive fetch cascades if the user navigates a dashboard with dozens of icons.
  
- **Concrete Code Impact**:
  Incognito or tablet embedded browser panels could experience minor stuttering or fetch spamming on page refreshes.
  
- **Fix**:
  Add a rate-limiter or a simple log flag to prevent excessive network spamming when IndexedDB is blocked.
  
  ```markdown
  ### Incognito Cache Fallback (Update to Spec 04 §4.5)
  If IndexedDB is detected as blocked or uninitialized, the dynamic icon loader must log a warning in the console, rate-limit concurrent fetches to 5 at a time, and utilize a simple, volatile window-level Map cache as an in-memory fallback.
  ```
