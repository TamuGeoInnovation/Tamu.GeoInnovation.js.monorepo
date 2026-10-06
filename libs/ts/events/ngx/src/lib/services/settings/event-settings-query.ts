import type { AggiemapCustomMapConfiguration } from '../../interfaces/special-event.interface';

/**
 * What a popup needs from `EventSettingsService`: the saved builder selections, as query parameters, and
 * the current map's definition.
 *
 * The popups' base class injects this rather than the service, so that it does not import the service.
 * The service imports every event definition and the definitions import the popups, so that import made
 * a cycle, and esbuild evaluated a popup before its base class: "Class extends value undefined" on
 * every page (#1403). `TsEventsNgxModule` provides it as the service.
 */
export abstract class EventSettingsQuery {
  public abstract readonly queryParamsFromSettings: URLSearchParams | null;

  public abstract eventConfiguration(): AggiemapCustomMapConfiguration;
}
