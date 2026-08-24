import { LayerSource } from '@tamu-gisc/common/types';
import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export interface EventConfiguration {
  /**
   * Unique identifier for the event. This is partially used to store the specific event settings in storage
   * and to identify the event in the application.
   */
  id: string;

  /**
   * The name of the event. This is used for display purposes. For example, in the event selection dropdown.
   */
  name: string;

  /**
   * The name of the application. This is used for display purposes. For example, as a title in the application.
   */
  applicationName: string;

  /**
   * The short name of the application. This is used for display purposes. Used in places where the long name would create
   * layout issues.
   */
  shortApplicationName: string;

  /**
   * Text to display to the user on the builder intro screen.
   *
   * This text gets merged with the event name with the template form:
   *
   * `${event.introductionText} ${event.name}`
   *
   * A default placeholder is thus provided if no introduction text is provided.
   */
  introductionText?: string;

  /**
   * The event dates. This is used to display the event dates to the user.
   *
   * This can be a string, date, or number
   *
   * - If a string is provided, it should be a valid date string that can be parsed by the
   * `Date` constructor.
   *
   * - If a number is provided, it should be a valid epoch timestamp.
   *
   * - If a date is provided, it should be a valid date object.
   */
  eventDates: Array<string | Date | number>;

  /**
   * Optional external URL linking to the event's official schedule page.
   * When provided, the event date display in the builder is rendered as a clickable link.
   */
  scheduleUrl?: string;

  mapCenter?: Array<number>;

  zoom?: number;

  /**
   * Enables rendering resolved selection notes in shared UI surfaces like the map sidebar.
   *
   * Defaults to `false` when omitted so existing events are unaffected.
   */
  enableResolvedSettingNotes?: boolean;

  /**
   * Allows legend entries to expose visibility toggles when supported by the consuming UI.
   *
   * Defaults to `false` when omitted.
   */
  legendAllowVisibilityToggle?: boolean;

  /**
   * Groups child legend items under their primary parent label when supported by the consuming UI.
   *
   * Defaults to `false` when omitted.
   */
  legendCombineChildrenUnderPrimary?: boolean;

  /**
   * Events can have exceptions for default map layers. This property allows for the ability to
   * define a set of default layer overrides that apply to a specific event.
   *
   * For example, a layer with id 'construction_zone-layer' can be set to not be visible by default:
   *
   * ```
   *  {
   *   "construction_zone-layer": {
   *     "listMode": 'hide',
   *     "native": {
   *       "visible": false
   *     }
   * }
   * ```
   */
  defaultLayerOverrides?: Record<string, Partial<LayerSource>>;

  /**
   * Toast notification configuration for the event. If provided, a toast notification will be
   * displayed when the event is active. This uses the same properties as NotificationProperties
   * from the notification service.
   */
  toast?: NotificationProperties;

  /**
   * Determines which builder step should open after intro.
   *
   * - `accommodations`: standard flow
   * - `review`: skip intermediate accommodations pages and go directly to review
   */
  builderStartStep?: 'accommodations' | 'review';

  /**
   * Text to display on the review step.
   */
  reviewText?: string;

  /**
   * Optional layer id whose features are briefly flashed (highlighted) once the event map finishes
   * loading and framing. Use it to draw the user's eye to a focal feature tied to a builder
   * selection — for example, the residence hall the user chose.
   *
   * Generic and opt-in: omit to disable. The layer's active definition expression is honored, so
   * only the currently-shown features flash.
   */
  flashLayerId?: string;

  /**
   * Optional informational panel rendered in the right-hand sidebar above the layer list and legend.
   *
   * Used to surface reference content that lives outside of the map data — for example, the
   * Break / Summer Parking dates that Transportation Services enforcement relies on.
   */
  sidebarInfo?: SidebarInfoPanel;

  /**
   * Layer ids that behave as a mutually-exclusive set: turning one on automatically turns the
   * others in the set off (radio-button behavior). Honored by the EventService once the layers
   * load and applies to visibility toggles from both the Layers (TOC) list and the legend.
   *
   * Defaults to no exclusivity when omitted, so existing events are unaffected.
   */
  exclusiveLayerIds?: string[];

  /**
   * Controls how the sidebar "Layers" (TOC) list orders its entries.
   *
   * - `title` (default): alphabetical by layer title.
   * - `source`: follows the event's reference/source order, matching the legend's draw order so
   *   the two surfaces agree.
   *
   * Defaults to `title` when omitted to preserve existing behavior for other events.
   */
  referenceLayerListOrder?: 'title' | 'source';

  /**
   * Layer ids that should always appear in the legend, even when they start hidden by default.
   * The legend normally only lists layers that have been visible at least once; use this to keep
   * an off-by-default layer listed (for example, the "off" half of a mutually-exclusive group).
   *
   * Defaults to none when omitted, preserving existing legend behavior for other events.
   */
  legendForceShowLayerIds?: string[];
}

/**
 * Static informational content rendered in the right-hand sidebar above Layers and Legend.
 */
export interface SidebarInfoPanel {
  sections: Array<SidebarInfoSection>;
}

export interface SidebarInfoSection {
  heading: string;
  subheading?: string;
  items?: Array<string>;

  /**
   * Optional per-section style overrides. When omitted, the section inherits the same look
   * as the Layers and Legend panels (heading from `.sidebar-component-name`, content from
   * `.sidebar-component-content-container`). Use this to opt-in to event-specific accent
   * colors or typography from the definition file.
   */
  styleOverrides?: SidebarInfoSectionStyleOverrides;
}

export interface SidebarInfoSectionStyleOverrides {
  heading?: Record<string, string>;
  subheading?: Record<string, string>;
  items?: Record<string, string>;
  item?: Record<string, string>;
}

/**
 * Representation of key-value pairs that define how the event map should be configured.
 */
export interface EventSettings extends Record<string, string | boolean | number | null | undefined> {
  /**
   * Whether or not the user requires accessible accommodations
   */
  accessible?: boolean;
}

/**
 * Object representing an event accommodation/options that can be selected by the user to customize the event map.
 */
export interface SpecialEventOption {
  /**
   * The value of the option. This is used to store the option in local store.
   */
  value: string;

  /**
   * Title of the option. This is used to display the option to the user.
   */
  label: string;

  /**
   * Description of the option. This is used to provide more information to the user.
   */
  description: string;

  /**
   * Short description of the option. This is used to provide a brief description to the user in summary views.
   */
  shortDescription: string;

  /**
   * Optional display layout used by the builder accommodations step.
   */
  uiType?: 'default' | 'date-card-grid' | 'grouped-card-grid' | 'binary';

  /**
   * Optional visibility condition. When present, this option is only shown as a builder step (and only
   * treated as required) when another option's saved value is one of `equalsAnyOf`.
   *
   * This enables conditional/branching builder flows without affecting events that omit it. For example,
   * an Entry/Exit `direction` step can be shown only for the transportation modes that have both directions:
   *
   * ```
   * visibleWhen: { setting: 'transport-type', equalsAnyOf: ['12th-man', 'parkmobile', 'micromobility'] }
   * ```
   *
   * An array of conditions is satisfied when *any* of them match, which allows a step shared by two
   * branches of the flow to be gated on either branch:
   *
   * ```
   * visibleWhen: [
   *   { setting: 'transport-type', equalsAnyOf: ['micromobility'] },
   *   { setting: 'vehicle-type', equalsAnyOf: ['parkmobile', 'presale'] }
   * ]
   * ```
   *
   * A condition whose gating option is itself hidden never matches, so a stale saved value for a step
   * that no longer applies cannot keep a dependent step visible.
   *
   * The referenced `setting` should generally appear earlier in the options array so its value is already
   * chosen by the time this option would be shown.
   */
  visibleWhen?: SpecialEventOptionVisibilityCondition | Array<SpecialEventOptionVisibilityCondition>;

  choices: Array<EventAccommodationOption>;

  effects: {
    layers?: Array<{
      /**
       * Layer ID of the layer that will be affected by the option.
       */
      layerId: string;

      /**
       * The published layer field id. Only used when simple input/output conversions are needed.
       *
       * Is not used when an expression is provided.
       */
      field?: string;

      /**
       * Since the effecting fields are not always the same across affecting layers, this property is used to
       * define the conversion between the input value and the output value.
       *
       * Consider the the tables A and B with their respective fields X and Y
       *
       * Table A
       * --------
       * Field X: Possible values are '1', '2', '3'
       *
       * Table B
       * --------
       * Field Y: Possible values are 'A', 'B', 'C'
       *
       * Where the `field` and `options` values are a perfect 1:1 match there is no need to define a conversion.
       *
       * However, in the case of Table B, the values are not the same. In this case, a conversion would be defined as:
       *
       * ```
       * conversions: [
       * { input: 'A', output: '1' },
       * { input: 'B', output: '2' },
       * { input: 'C', output: '3' }
       * ]
       * ```
       *
       */
      conversions?: Array<ISpecialEventOptionEffectsConversion>;
    }>;
  };
}

/**
 * A single gating condition used by {@link SpecialEventOption.visibleWhen}.
 */
export interface SpecialEventOptionVisibilityCondition {
  /**
   * The `value` (key) of another {@link SpecialEventOption} whose saved selection gates this option.
   */
  setting: string;

  /**
   * This option is only visible/required when the gating setting's saved value is one of these.
   */
  equalsAnyOf: Array<string | number | boolean>;
}

export enum ConversionDeconflictingStrategy {
  REPLACE = 'replace',
  IGNORE = 'ignore',
  APPEND_AND = 'append-and',
  APPEND_OR = 'append-or'
}

interface ISpecialEventOptionEffectsConversion {
  /**
   * The input value of the conversion. This is the value that will be used to determine the output value. Typically an event accommodation choice
   */
  input: string;

  /**
   * Given an input value, this is the output value that will be used to set the definition expression on the layer. Useful for simple input/output conversions.
   *
   * This is not used when an expression is provided.
   */
  output?: string | number | boolean;

  /**
   * Given an input value, this is used to set a raw definition expression on the source layers, which is useful for more complex expressions.
   */
  expression?: string;

  /**
   * Object of layer properties that will be merged and overwritten in the source layer source.
   *
   * This enables the ability to, for example, show/hide layers based on accommodation selections.
   */
  propOverrides?: Partial<Omit<LayerSource, 'type' | 'id' | 'title' | 'url'>>;

  /**
   * If a layer is affected by multiple effects, this property determines how the effects are applied.
   *
   * - `replace` will replace the current definition expression with the new one.
   * - `ignore` will ignore the new definition expression.
   * - `append-and` will append the new definition expression with an `AND` operator.
   * - `append-or` will append the new definition expression with an `OR` operator.
   */
  deconflictingStrategy?: ConversionDeconflictingStrategy;
}

/**
 * A collection of special event options that can be selected by the user to customize the event map.
 */
export type SpecialEventOptions = Array<SpecialEventOption>;

export interface EventAccommodationOption {
  /**
   * The value of the option. This is the result of a user selection for a given accommodation.
   */
  value: string | boolean | number;

  /**
   * The label of the option. This is used to display the option to the user.
   */
  label: string;

  /**
   * Optional secondary label for specialized UI layouts.
   */
  secondaryLabel?: string;

  /**
   * Optional group name for grouped card layouts.
   */
  group?: string;

  /**
   * Optional note that can be surfaced by events that opt into resolved setting notes.
   */
  note?: string;

  /**
   * Optional map view applied once the event layers load when this choice is the active selection.
   *
   * Use this to recenter the map on a fixed location tied to a builder choice (for example, a session
   * whose drop-off location differs from other sessions). When provided, it takes precedence over the
   * configuration-level `mapCenter`/`zoom` and avoids any feature-extent computation, giving precise,
   * hand-tunable control over the framing.
   */
  mapView?: {
    /**
     * Map center as `[longitude, latitude]`.
     */
    center: [number, number];

    /**
     * Optional zoom level. When omitted, the current view zoom is preserved.
     */
    zoom?: number;
  };
}

export interface ResolvedEventSetting {
  key: string;
  shortDescription: string;
  option: {
    value: string | boolean | number | null;
    label: string;
    note?: string;
  } | null;
}

export type ResolvedEventSettings = Array<ResolvedEventSetting>;

export interface IMapConfigurationBase {
  configuration: EventConfiguration | null;
  options: SpecialEventOptions | null;
  references: Record<string, string> | null;
  sources: Array<LayerSource> | null;

  /**
   * If the map should be discoverable in the Discover application, this property should be set to an object that conforms to the DiscoverMetadata interface.
   */
  discover?: DiscoverMetadata | null;
}

interface ISpecialEventRoot extends IMapConfigurationBase {
  type: 'special-event';
}

interface IGeneralMapRoot extends IMapConfigurationBase {
  type: 'general-map';
}

export type AggiemapCustomMapConfiguration = ISpecialEventRoot | IGeneralMapRoot;

/**
 * High-level discover grouping used by the tabbed Discover page UI.
 */
export type DiscoverMapType = 'parking' | 'campus' | 'athletics' | 'operations';

/**
 * Metadata used to represent a map in the Discover application.
 */
export interface DiscoverMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  keywords?: string[];
  /**
   * Controls whether the map appears in public discover lists.
   * Defaults to `true` when omitted.
   */
  visible?: boolean;
  /**
   * Optional labels to display on the application card (e.g., "New", "Beta", etc.)
   *
   * These will generally be used as chips or badges and are intended to be used to supplement the `type` field.
   */
  labels?: string[];
  source: 'internal';
  type: 'event' | 'parking' | 'operations';
  /**
   * Optional tab grouping override for the Discover page.
   *
   * When omitted, consuming UIs can derive a sensible default from `type`.
   */
  mapType?: DiscoverMapType;

  /**
   * Optional sub-category used to group parking maps into named columns (General / Business / Permit)
   * on the Parking Maps page. Only relevant when `mapType` resolves to `parking`. When omitted, a
   * parking map falls back to the `general` column.
   */
  parkingCategory?: ParkingCategory;

  /**
   * Optional column key used by map pages that render named columns.
   * When omitted, the page should fall back to a safe default layout.
   */
  columnKey?: string;

  /**
   * Marks a discoverable map as eligible for the Quick Links section on the All Maps pages.
   * Defaults to `false` when omitted.
   */
  showInQuickLinks?: boolean;

  /**
   * Controls the order of the map within the Quick Links section when `showInQuickLinks` is true.
   * Lower values appear first. Invalid or duplicate values fall back to a safe default order.
   */
  quickLinkOrder?: number;
}

/**
 * Sub-grouping for parking maps on the Parking Maps page.
 */
export type ParkingCategory = 'general' | 'business' | 'permit';
