/**
 * Home Assistant Extended Types — v2
 * Pure readonly interfaces. Never mutate these.
 */

// ─── Core HA types ────────────────────────────────────────────────────────────

export interface HassEntityAttributes {
  readonly friendly_name?: string;
  readonly [key: string]: unknown;
}

export interface HassEntity {
  readonly entity_id: string;
  readonly state: string;
  readonly attributes: HassEntityAttributes;
  readonly last_changed: string;
  readonly last_updated: string;
}

export interface HassArea {
  readonly area_id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly floor_id: string | null;
  readonly icon: string | null;
  readonly labels: readonly string[];
  readonly picture: string | null;
}

export interface HassFloor {
  readonly floor_id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly icon: string | null;
  readonly level: number | null;
}

export interface HassEntityEntry {
  readonly entity_id: string;
  readonly area_id: string | null;
  readonly device_id: string | null;
  readonly disabled_by: string | null;
  /** Not sent by the HA entity_registry API: derive the domain from the entity_id prefix. */
  readonly domain?: string;
  readonly platform: string;
  readonly labels: readonly string[];
}

export interface HassDeviceEntry {
  readonly id: string;
  readonly area_id: string | null;
  readonly name: string | null;
  readonly manufacturer: string | null;
  readonly model: string | null;
  readonly labels: readonly string[];
}

export interface HassLocale {
  readonly language: string;
  readonly number_format: string;
  readonly time_format: string;
}

export interface HassServiceResponse {
  readonly [key: string]: unknown;
}

// ─── HomeAssistantExt — superset of the hass object HA passes to cards ────────

export interface HomeAssistantExt {
  readonly states: Readonly<Record<string, HassEntity>>;
  readonly areas: Readonly<Record<string, HassArea>>;
  readonly floors: Readonly<Record<string, HassFloor>>;
  readonly entities: Readonly<Record<string, HassEntityEntry>>;
  readonly devices: Readonly<Record<string, HassDeviceEntry>>;
  readonly locale: HassLocale;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly is_admin: boolean;
  };
  readonly config?: {
    readonly unit_system?: {
      readonly temperature?: string;
      readonly pressure?: string;
      readonly [key: string]: string | undefined;
    };
  };
  /** REST call through HA's authenticated fetch (GET /api/<path>). */
  readonly callApi: <T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, parameters?: Record<string, unknown>) => Promise<T>;
  readonly connection: {
    sendMessagePromise: <T>(message: Record<string, unknown>) => Promise<T>;
    subscribeMessage?: <T>(
      callback: (message: T) => void,
      params: Record<string, unknown>
    ) => Promise<() => void | Promise<void>>;
  };
  /**
   * HA's translated rendering of an entity state (frontend >= 2023.9); absent on some hosts.
   * Ref: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
   */
  readonly formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  /** Frontend helper over connection.sendMessagePromise; absent on some hosts (dev workbench). */
  callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ): Promise<HassServiceResponse>;
}
