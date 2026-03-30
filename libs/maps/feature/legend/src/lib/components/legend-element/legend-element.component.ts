import { Component, Input, OnInit } from '@angular/core';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  iif,
  map,
  Observable,
  of,
  shareReplay,
  toArray
} from 'rxjs';

import esri = __esri;

/**
 * Legend Element Component
 *
 * This component renders individual legend elements and provides enhanced support for
 * definition expression filtering. The component now uses ArcGIS JS API capabilities
 * to accurately determine legend element visibility based on complex T-SQL definition
 * expressions, moving beyond simple string parsing.
 *
 * Key improvements:
 * - Uses layer.queryFeatureCount() to test if legend values would return features
 * - Properly handles complex T-SQL expressions with joins, functions, and nested conditions
 * - Escapes SQL values properly to prevent injection issues
 * - Falls back to original simple parsing if API queries fail
 * - Supports multi-field unique value renderers with proper field delimiter handling
 */

@Component({
  selector: 'tamu-gisc-legend-element',
  templateUrl: './legend-element.component.html',
  styleUrls: ['./legend-element.component.scss']
})
export class LegendElementComponent implements OnInit {
  constructor(private readonly moduleProvider: EsriModuleProviderService) {}

  private readonly sportsSafetyFirstLayerIds = new Set([
    'softball-parking-safety-first',
    'swimming-parking-safety-first',
    'soccer-parking-safety-first',
    'volleyball-parking-safety-first',
    'indoor-track-parking-safety-first',
    'outdoor-track-parking-safety-first'
  ]);

  private readonly sportsSafetyFirstLegendSrc =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAPElEQVQ4jWNhoDJgGTVwcIfhfwrNYkQx8P/vNspMY62isZcZoTZQzUBqAZaRHYaM1DaQKoCFOsYwjGQDAaloCFLg0b/eAAAAAElFTkSuQmCC';

  private readonly sportsSafetyFirstLegendLabel = 'Please use marked crosswalks. No mid-street crossing.';

  private readonly collapsedLegendLayerIds = new Set([
    'bike-racks-layer',
    'bike-racks-map-layer',
    'sustainable-transportation-bike-racks',
    'ts-bike-racks'
  ]);

  private readonly collapsedLegendLayerUrls = ['/TS/TS_Bicycles/MapServer/3', '/TS/BikeMap/MapServer/0'];

  private readonly secGroundsRouteLayerIds = new Set([
    'sec-grounds-day1-routes',
    'sec-grounds-day2-routes',
    'sec-grounds-day3-routes'
  ]);

  private readonly secGroundsRouteLayerUrls = [
    '/TS/SEC_Grounds_Conference/MapServer/2',
    '/TS/SEC_Grounds_Conference/MapServer/5',
    '/TS/SEC_Grounds_Conference/MapServer/8'
  ];

  @Input()
  public element: ILegendElement;

  @Input()
  public layer: ILayer;

  @Input()
  public groupTitle: string;

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicateChildren = false;

  @Input()
  public respectDefinitionExpression = false;

  @Input()
  public hideGroupHeader = false;

  @Input()
  public useBikeRackLegendTransform: boolean | undefined = undefined;

  public infos: Observable<Array<LegendInfo>>;
  public expanded = true;

  public get showGroupHeader(): boolean {
    if (this.hideGroupHeader) {
      return false;
    }

    if (this.shouldApplyBikeRackLegendTransform) {
      return false;
    }

    const infos = this.element?.infos as { length?: number } | undefined;

    return typeof infos?.length === 'number' && infos.length > 1;
  }

  public get useGroupTitleLabel(): boolean {
    return !this.shouldApplyBikeRackLegendTransform && this.element?.infos?.length === 1;
  }

  public get displayGroupTitle(): string {
    return this.groupTitle;
  }

  public toggleExpanded(): void {
    if (this.showGroupHeader) {
      this.expanded = !this.expanded;
    }
  }

  public async ngOnInit(): Promise<void> {
    if (!this.element?.infos) {
      this.infos = of([]);
      return;
    }

    const operableInfos = (this.element.infos ?? []) as Array<LegendInfo>;
    const bikeRackAdjustedInfos = this.shouldApplyBikeRackLegendTransform ? this._getBikeRackLegendInfos(operableInfos) : operableInfos;
    const displayInfos = this.shouldUseCustomSecGroundsRouteLegend
      ? this._getSecGroundsRouteLegendInfos(bikeRackAdjustedInfos)
      : bikeRackAdjustedInfos;

    this.infos = iif(
      () => {
        return this.deduplicateChildren;
      },
      from(
        displayInfos.filter((info, index, self) => {
          return index === self.findIndex((t) => t.label === info.label);
        }) as Array<LegendInfo>
      ),
      from(displayInfos)
    ).pipe(
      concatMap((info: LegendInfo) => {
        // If we are not respecting definition expressions, return the current legend info as-is
        if (this.respectDefinitionExpression === false || this.layer === undefined) {
          return of(info);
        }

        const operableLayer = this.layer as esri.FeatureLayer;

        // If operable layer has no definition expression, return the current legend info as-is
        if (operableLayer.definitionExpression === null || operableLayer.definitionExpression === undefined) {
          return of(info);
        }

        const renderer = operableLayer.renderer as esri.UniqueValueRenderer;

        if (renderer.type !== 'unique-value') {
          return of(info);
        }

        if (
          renderer === null ||
          renderer === undefined ||
          renderer.uniqueValueInfos === null ||
          renderer.uniqueValueInfos === undefined ||
          renderer.uniqueValueInfos.length === 0
        ) {
          return of(info);
        }

        // Otherwise, we need to filter the infos based on the layer's definition expression
        try {
          // Use ArcGIS JS API to robustly evaluate definition expression against legend values
          return this._filterLegendInfosWithQuery(operableLayer, renderer, info);
        } catch (error) {
          console.warn('Failed to evaluate definition expression using ArcGIS API, falling back to simple parsing:', error);
          // Fall back to the original simple parsing approach
          return this._fallbackToSimpleParsing(operableLayer, renderer, info);
        }
      }),
      filter((infoOrNull): infoOrNull is LegendInfo => {
        return infoOrNull !== null;
      }),
      toArray(),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  public useSportsSafetyFirstFallback(): boolean {
    return (
      this.sportsSafetyFirstLayerIds.has(this.layer?.id) ||
      this.sportsSafetyFirstLayerIds.has((this.layer as unknown as esri.Sublayer)?.layer?.id)
    );
  }

  public getSportsSafetyFirstLegendSrc(): string {
    return this.sportsSafetyFirstLegendSrc;
  }

  public getSportsSafetyFirstLegendLabel(): string {
    return this.sportsSafetyFirstLegendLabel;
  }

  /**
   * Uses ArcGIS JS API to robustly evaluate which legend items would return features
   * given the current definition expression. This handles complex T-SQL expressions properly.
   */
  private _filterLegendInfosWithQuery(
    layer: esri.FeatureLayer,
    renderer: esri.UniqueValueRenderer,
    info: LegendInfo
  ): Observable<LegendInfo | null> {
    // Get the fields used in the renderer
    const operableFields = [renderer.field, renderer.field2, renderer.field3].filter((f) => f !== null && f !== undefined);

    if (operableFields.length === 0) {
      return of(info); // No operable fields, return as is
    }

    // Test each legend info by performing a query to see if it would return any features
    try {
      // Construct the where clause for this specific legend value
      const legendWhereClause = this._buildLegendWhereClause(renderer, operableFields, info);

      // Combine the legend where clause with the layer's definition expression
      const combinedWhere = layer.definitionExpression
        ? `(${layer.definitionExpression}) AND (${legendWhereClause})`
        : legendWhereClause;

      return from(
        layer.queryFeatureCount({
          where: combinedWhere
        })
      ).pipe(
        map((count) => {
          // If count is greater than 0, the legend item is valid
          if (count > 0) {
            return info;
          } else {
            // If count is 0, the legend item is not valid
            return null;
          }
        }),
        catchError((error) => {
          console.error('Error querying layer for legend item:', info, error);
          return of(null);
        })
      );
    } catch (error) {
      // If query fails for this specific legend item, include it to be safe
      console.warn('Failed to evaluate legend item, including in legend:', info, error);
      return of(info);
    }
  }

  /**
   * Builds a where clause for a specific legend value based on the renderer configuration
   */
  private _buildLegendWhereClause(renderer: esri.UniqueValueRenderer, operableFields: string[], info: unknown): string {
    const infoValue = (info as { value: string }).value;

    if (!infoValue) {
      return '1=1'; // Return all if no value
    }

    // Split the value by the field delimiter to get individual field values
    //
    // infoValues can be a concatenation of several fields, in which case they need to be split into value parts.
    //
    // However in many cases there is a single value, and it can be of type string or number (possibly boolean),
    // in which case we need to simply use it as is.
    //
    // Have not seen a hybrid of multiple data types so that particular case is not handled and will simply
    // default to showing it on the legend.

    const valueParts = typeof infoValue === 'string' ? `${infoValue}`.split(renderer.fieldDelimiter || ',') : [infoValue];

    const whereParts: string[] = [];

    // Build where clause parts for each field
    operableFields.forEach((field, index) => {
      if (index < valueParts.length) {
        const value = valueParts[index];

        // Handle different value types and proper SQL escaping
        if (value === null || value === undefined || value === 'null') {
          whereParts.push(`${field} IS NULL`);
        } else if (typeof value === 'string') {
          // Escape single quotes and wrap in quotes for string values
          const escapedValue = value.replace(/'/g, "''");
          whereParts.push(`${field} = '${escapedValue}'`);
        } else {
          // Numeric or other values
          whereParts.push(`${field} = ${value}`);
        }
      }
    });

    return whereParts.length > 0 ? whereParts.join(' AND ') : '1=1';
  }

  /**
   * Fallback to the original simple parsing approach if the API-based method fails
   */
  private _fallbackToSimpleParsing(
    operableLayer: esri.FeatureLayer,
    renderer: esri.UniqueValueRenderer,
    info: LegendInfo
  ): Observable<LegendInfo | null> {
    // Determine how many fields are expected in the renderer value string.
    // This is necessary because the renderer value string can be a concatenation of multiple fields.
    const operableFields = [renderer.field, renderer.field2, renderer.field3].filter((f) => f !== null);

    // If there are no operable fields, return early
    if (operableFields.length === 0) {
      return of(info);
    }

    // Unique value expressions can at most be a concatenation of 3 fields, with exact value matches. This means
    // that we can split the definition expression by the AND operator and check if any of the fields in the renderer
    // are part of the expression.
    //
    // We split the definition expression by the AND operator to get the individual expressions, if any.
    const expressions = operableLayer.definitionExpression.split('AND').map((exp) => exp.trim());

    // For every grouped expression, split it by the '=' comparison operator to get the field and value.
    const fieldValuePairs = expressions.map((exp) => {
      const [field, value] = exp.split('=').map((part) => part.trim());
      return { field, value: value.replace(/'/g, '') };
    });

    // Test if either expression includes any of the fields in the renderer value string.
    // If it does, we can filter the legend element infos to only include those that match the definition expression.
    // Deconstruct legend info.value so we can accurately compare it to the definition expression.
    const infoWithValue = info as { value: string };
    const valueParts = operableFields.length ? infoWithValue.value.split(renderer.fieldDelimiter) : [infoWithValue.value];

    const has = fieldValuePairs.some((pair) => {
      return operableFields.some((field) => {
        const operableValue = valueParts[operableFields.indexOf(field)];

        return pair.field === field && pair.value === operableValue;
      });
    });

    if (has) {
      return of(info);
    } else {
      return of(null);
    }
  }

  private get shouldApplyBikeRackLegendTransform(): boolean {
    return this.useBikeRackLegendTransform === undefined
      ? this.shouldUseCustomBikeRackLegend
      : this.useBikeRackLegendTransform && this.shouldUseCustomBikeRackLegend;
  }

  private get shouldUseCustomBikeRackLegend(): boolean {
    const layerCandidates = [this.layer, (this.layer as unknown as esri.Sublayer)?.layer].filter((candidate) => {
      return candidate !== null && candidate !== undefined;
    }) as Array<{ id?: string; url?: string }>;

    return layerCandidates.some((candidate) => {
      const url = candidate.url ?? '';

      return (
        this.collapsedLegendLayerIds.has(candidate.id ?? '') ||
        this.collapsedLegendLayerUrls.some((collapsedUrl) => url.includes(collapsedUrl))
      );
    });
  }

  private get shouldUseCustomSecGroundsRouteLegend(): boolean {
    const layerCandidates = [this.layer, (this.layer as unknown as esri.Sublayer)?.layer].filter((candidate) => {
      return candidate !== null && candidate !== undefined;
    }) as Array<{ id?: string; url?: string }>;

    return layerCandidates.some((candidate) => {
      const url = candidate.url ?? '';

      return (
        this.secGroundsRouteLayerIds.has(candidate.id ?? '') ||
        this.secGroundsRouteLayerUrls.some((routeUrl) => url.includes(routeUrl))
      );
    });
  }

  private _getBikeRackLegendInfos(infos: Array<LegendInfo>): Array<LegendInfo> {
    const flattenedInfos = this._flattenLegendInfos(infos);

    if (flattenedInfos.length <= 1) {
      const fallbackLabel = this.groupTitle?.trim() || 'Bike Racks';

      return flattenedInfos.map((info) => {
        if (this._hasLegendInfoLabel(info)) {
          return info;
        }

        return {
          ...(info as unknown as Record<string, unknown>),
          label: fallbackLabel
        } as LegendInfo;
      });
    }

    const hubCorralInfo = flattenedInfos.find((info) => this._matchesLegendInfoLabel(info, 'Hub Corral'));
    const sharedMobilityInfo = flattenedInfos.find((info) => this._matchesLegendInfoLabel(info, 'Shared Mobility Racks'));
    const regularBikeRackInfos = flattenedInfos.filter((info) => !this._isBikeRackSpecialLegendLabel(info));

    const displayInfos: Array<LegendInfo> = [];

    if (hubCorralInfo) {
      displayInfos.push(hubCorralInfo);
    }

    if (sharedMobilityInfo) {
      displayInfos.push(sharedMobilityInfo);
    }

    if (regularBikeRackInfos.length > 0) {
      const representativeInfo = this._getRepresentativeLegendInfo(regularBikeRackInfos);

      displayInfos.push({
        ...(representativeInfo as unknown as Record<string, unknown>),
        label: 'Bike Racks'
      } as LegendInfo);
    }

    return displayInfos.length > 0 ? displayInfos : flattenedInfos;
  }

  private _getSecGroundsRouteLegendInfos(infos: Array<LegendInfo>): Array<LegendInfo> {
    return infos.map((info) => {
      const nestedInfos = this._toLegendInfoArray((info as { infos?: unknown }).infos);

      if ((info as { type?: string }).type === 'symbol-table' && nestedInfos.length > 0) {
        return {
          ...(info as unknown as Record<string, unknown>),
          infos: this._getSecGroundsRouteLegendInfos(nestedInfos)
        } as unknown as LegendInfo;
      }

      const label = ((info as { label?: string }).label ?? '').trim();
      const src = this._getSecGroundsRouteLegendSrc(label);

      if (src === undefined) {
        return info;
      }

      return {
        ...(info as unknown as Record<string, unknown>),
        src,
        preview: undefined
      } as unknown as LegendInfo;
    });
  }

  private _getSecGroundsRouteLegendSrc(label: string): string | undefined {
    if (label.startsWith('Bus Tour Route Day ')) {
      return this._toSvgDataUri(this._getSecGroundsBusRouteLegendSvg());
    }

    if (label.startsWith('Walking Tour Day ')) {
      return this._toSvgDataUri(this._getSecGroundsWalkingRouteLegendSvg());
    }

    return undefined;
  }

  private _getSecGroundsBusRouteLegendSvg(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16" viewBox="0 0 48 16" fill="none"><path d="M2 8H46" stroke="#005CE6" stroke-width="3.5" stroke-linecap="round"/><path d="M11 4.5V11.5L17 8L11 4.5Z" fill="#005CE6"/><path d="M22 4.5V11.5L28 8L22 4.5Z" fill="#005CE6"/><path d="M33 4.5V11.5L39 8L33 4.5Z" fill="#005CE6"/></svg>';
  }

  private _getSecGroundsWalkingRouteLegendSvg(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16" viewBox="0 0 48 16" fill="none"><path d="M2 8H46" stroke="#38A800" stroke-width="4.6" stroke-linecap="square"/><path d="M2 8H46" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="square"/><path d="M2 8H46" stroke="#38A800" stroke-width="1.4" stroke-linecap="square" stroke-dasharray="4 4"/></svg>';
  }

  private _toSvgDataUri(svg: string): string {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private _flattenLegendInfos(infos: Array<LegendInfo>): Array<LegendInfo> {
    return infos.reduce<Array<LegendInfo>>((acc, info) => {
      const nestedInfos = this._toLegendInfoArray((info as { infos?: unknown }).infos);

      if ((info as { type?: string }).type === 'symbol-table' && nestedInfos.length > 0) {
        return acc.concat(this._flattenLegendInfos(nestedInfos));
      }

      return acc.concat(info);
    }, []);
  }

  private _toLegendInfoArray(infos: unknown): Array<LegendInfo> {
    if (!infos) {
      return [];
    }

    if (Array.isArray(infos)) {
      return infos as Array<LegendInfo>;
    }

    const collection = infos as { toArray?: () => Array<LegendInfo>; length?: number; getItemAt?: (index: number) => LegendInfo };

    if (typeof collection.toArray === 'function') {
      return collection.toArray();
    }

    if (typeof collection.length === 'number' && typeof collection.getItemAt === 'function') {
      return Array.from({ length: collection.length }, (_, index) => collection.getItemAt(index));
    }

    return [];
  }

  private _matchesLegendInfoLabel(info: LegendInfo, label: string): boolean {
    return ((info as { label?: string }).label ?? '').trim().toLowerCase() === label.toLowerCase();
  }

  private _hasLegendInfoLabel(info: LegendInfo): boolean {
    return ((info as { label?: string }).label ?? '').trim().length > 0;
  }

  private _isBikeRackSpecialLegendLabel(info: LegendInfo): boolean {
    return this._matchesLegendInfoLabel(info, 'Hub Corral') || this._matchesLegendInfoLabel(info, 'Shared Mobility Racks');
  }

  private _getRepresentativeLegendInfo(infos: Array<LegendInfo>): LegendInfo {
    const counts = new Map<string, { count: number; firstIndex: number }>();

    infos.forEach((info, index) => {
      const key = this._getLegendInfoSymbolKey(info);
      const existing = counts.get(key);

      counts.set(key, {
        count: (existing?.count ?? 0) + 1,
        firstIndex: existing?.firstIndex ?? index
      });
    });

    const representativeKey = Array.from(counts.entries()).sort((a, b) => {
      if (a[1].count !== b[1].count) {
        return b[1].count - a[1].count;
      }

      return a[1].firstIndex - b[1].firstIndex;
    })[0]?.[0];

    return infos.find((info) => this._getLegendInfoSymbolKey(info) === representativeKey) ?? infos[0];
  }

  private _getLegendInfoSymbolKey(info: LegendInfo): string {
    const legendInfo = info as { src?: string; preview?: unknown; label?: string };

    if (legendInfo.src) {
      return `src:${legendInfo.src}`;
    }

    if (legendInfo.preview) {
      return `preview:${String(legendInfo.preview)}`;
    }

    return `label:${legendInfo.label ?? ''}`;
  }
}

// Browser doesn't like direct esri types for inputs.
// P.S For whoever looks at this in the future and wonders what the heck is going on with
// LegendInfo and ILegendElement? I don't know. It's late, and I'm too tired to worry/care about it.
// It works. Good luck :|
type ILegendElement = esri.LegendElement;
type ILayer = esri.Layer;
type LegendInfo =
  | esri.SymbolTableElementType
  | esri.ColorRampStop
  | esri.OpacityRampStop
  | esri.SizeRampStop
  | esri.HeatmapRampStop;
