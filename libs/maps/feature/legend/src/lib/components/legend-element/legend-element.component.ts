import { Component, OnChanges, SimpleChanges, inject, input } from '@angular/core';

import { EsriModuleProviderService, LayerSourcesService } from '@tamu-gisc/maps/esri';
import { LayerLegendOverride } from '@tamu-gisc/common/types';
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
import { NgStyle, AsyncPipe } from '@angular/common';

import { ElementInsertDirective } from '@tamu-gisc/ui-kits/ngx/layout';

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
  styleUrls: ['./legend-element.component.scss'],
  imports: [NgStyle, ElementInsertDirective, AsyncPipe]
})
export class LegendElementComponent implements OnChanges {
  private readonly moduleProvider = inject(EsriModuleProviderService);
  private readonly layerSourcesService = inject(LayerSourcesService);

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

  public readonly element = input<ILegendElement>(undefined);

  public readonly layer = input<ILayer>(undefined);

  public readonly groupTitle = input<string>(undefined);

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  public readonly deduplicateChildren = input(false);

  public readonly respectDefinitionExpression = input(false);

  public readonly hideGroupHeader = input(false);

  public infos: Observable<Array<LegendInfo>>;
  public expanded = true;

  public get showGroupHeader(): boolean {
    if (this.hideGroupHeader()) {
      return false;
    }

    const infos = this.element()?.infos as { length?: number } | undefined;

    return typeof infos?.length === 'number' && infos.length > 1;
  }

  public get useGroupTitleLabel(): boolean {
    return this.element()?.infos?.length === 1;
  }

  public get displayGroupTitle(): string {
    return this.groupTitle();
  }

  /**
   * Whether a nested symbol table holds more symbol tables, rather than the classes themselves.
   *
   * A unique value renderer published from ArcGIS Pro carries `uniqueValueGroups` headed by the field
   * name, so its classes arrive one level down, as plain legend infos. Those are rendered as one
   * element; only nested tables are recursed into one by one.
   */
  public holdsNestedTables(info: unknown): boolean {
    const infos = (info as { infos?: Array<{ type?: string }> })?.infos ?? [];

    return infos.some((child) => child?.type === 'symbol-table');
  }

  /** A nested symbol table whose entries are the classes themselves (see `holdsNestedTables`). */
  public isGroupOfClasses(info: unknown): boolean {
    return (info as { type?: string })?.type === 'symbol-table' && !this.holdsNestedTables(info);
  }

  public toggleExpanded(): void {
    if (this.showGroupHeader) {
      this.expanded = !this.expanded;
    }
  }

  /**
   * Reads the element's symbols again whenever the element is replaced, not once on creation.
   *
   * ArcGIS replaces a layer's legend element when the layer's renderer changes, and a hosted layer's
   * renderer changes shortly after it loads: it arrives with the symbol its service publishes and is
   * then given the one its portal item publishes (#1497). The new element has the same label and value
   * as the old, so the list above keeps this component and hands it the new element. Read once, the
   * legend went on showing the service's symbol beside a map drawing the portal's (#1721).
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['element']) {
      return;
    }

    if (!this.element()?.infos) {
      this.infos = of([]);
      return;
    }

    const operableInfos = (this.element().infos ?? []) as Array<LegendInfo>;

    this.infos = iif(
      () => {
        return this.deduplicateChildren();
      },
      from(
        operableInfos.filter((info, index, self) => {
          return index === self.findIndex((t) => legendInfoLabel(t) === legendInfoLabel(info));
        }) as Array<LegendInfo>
      ),
      from(operableInfos)
    ).pipe(
      concatMap((info: LegendInfo) => {
        // If we are not respecting definition expressions, return the current legend info as-is
        const layer = this.layer();
        if (this.respectDefinitionExpression() === false || layer === undefined) {
          return of(info);
        }

        // Per-layer opt-out: a layer can request its full renderer legend (every category) even when a
        // definition expression is filtering what's drawn — used for reference color keys.
        if (this.legendOverride?.ignoreDefinitionExpression === true) {
          return of(info);
        }

        const operableLayer = layer as esri.FeatureLayer;

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

  /**
   * Returns the configured legend override for the current layer, if any.
   *
   * Resolves against both the layer's own id and (for sublayers) the parent layer's id so the
   * override applies for either top-level feature layers or sublayers of map-image layers.
   */
  public get legendOverride(): LayerLegendOverride | undefined {
    const layer = this.layer();
    const candidateIds = [layer?.id, (layer as unknown as esri.Sublayer)?.layer?.id].filter(
      (id): id is string => typeof id === 'string'
    );

    for (const id of candidateIds) {
      const match = this.layerSourcesService?.getLegendOverride?.(id);
      if (match) {
        return match;
      }
    }

    return undefined;
  }

  /**
   * True when the override is active for the supplied info — i.e. it specifies a custom rendering
   * mode or any sizing/fit hint. When false, the template falls back to existing default rendering.
   */
  public hasLegendOverrideForInfo(info: unknown): boolean {
    const override = this.legendOverride;

    if (!override) {
      return false;
    }

    if (override.mode === 'custom-src' && !override.src) {
      return false;
    }

    return this.resolveLegendIconSrc(info) !== null;
  }

  /**
   * Resolve the icon URL for `info` based on the configured override mode.
   *
   * - `custom-src`: returns the explicit override URL.
   * - `renderer-symbol`: extracts the picture-marker URL from the layer's renderer that matches
   *   the legend info's value (for unique-value renderers) or the single symbol (for simple renderers).
   * - `arcgis` (default): returns the info's own `src` or `preview` image URL if available.
   *
   * Returns null when no URL can be resolved — the template should then fall through to default rendering.
   */
  public resolveLegendIconSrc(info: unknown): string | null {
    const override = this.legendOverride;

    if (!override) {
      return null;
    }

    if (override.mode === 'custom-src') {
      return override.src ?? null;
    }

    if (override.mode === 'renderer-symbol') {
      const fromRenderer = this._extractSymbolUrl(info);
      if (fromRenderer) {
        return fromRenderer;
      }
    }

    const infoSrc = (info as { src?: string })?.src;
    if (typeof infoSrc === 'string' && infoSrc.length > 0) {
      return infoSrc;
    }

    const previewSrc = this._extractPreviewImageSrc(info);
    return previewSrc;
  }

  /**
   * Builds the `[ngStyle]` payload applied to the override `<img>` element. Honors `width`,
   * `height`, `fit`, and `preserveAspectRatio`.
   */
  public get legendOverrideStyles(): Record<string, string> {
    const override = this.legendOverride;
    const styles: Record<string, string> = {};

    if (!override) {
      return styles;
    }

    if (typeof override.width === 'number') {
      styles['width'] = `${override.width}px`;
    }

    if (typeof override.height === 'number') {
      styles['height'] = `${override.height}px`;
    }

    if (override.fit) {
      styles['object-fit'] = override.fit;
    } else if (override.preserveAspectRatio) {
      styles['object-fit'] = 'contain';
    }

    return styles;
  }

  private _extractSymbolUrl(info: unknown): string | null {
    const renderer = (this.layer() as esri.FeatureLayer)?.renderer;
    if (!renderer) {
      return null;
    }

    const infoValue = (info as { value?: unknown })?.value;

    if (renderer.type === 'unique-value') {
      const uniqueRenderer = renderer as esri.UniqueValueRenderer;
      const match = uniqueRenderer.uniqueValueInfos?.find((u) => `${u.value}` === `${infoValue}`);
      const url = (match?.symbol as { url?: string })?.url;
      if (typeof url === 'string' && url.length > 0) {
        return url;
      }

      const defaultUrl = (uniqueRenderer.defaultSymbol as { url?: string })?.url;
      return typeof defaultUrl === 'string' && defaultUrl.length > 0 ? defaultUrl : null;
    }

    if (renderer.type === 'simple') {
      const simpleRenderer = renderer as esri.SimpleRenderer;
      const url = (simpleRenderer.symbol as { url?: string })?.url;
      return typeof url === 'string' && url.length > 0 ? url : null;
    }

    return null;
  }

  private _extractPreviewImageSrc(info: unknown): string | null {
    const preview = (info as { preview?: Element })?.preview;
    if (!preview) {
      return null;
    }

    const img = preview instanceof HTMLImageElement ? preview : preview.querySelector?.('img');
    const src = (img as HTMLImageElement | null)?.src;
    return typeof src === 'string' && src.length > 0 ? src : null;
  }

  public useSportsSafetyFirstFallback(): boolean {
    const layer = this.layer();
    return (
      this.sportsSafetyFirstLayerIds.has(layer?.id) ||
      this.sportsSafetyFirstLayerIds.has((layer as unknown as esri.Sublayer)?.layer?.id)
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
      const legendWhereClause = this._buildLegendWhereClause(layer, renderer, operableFields, info);

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
          // A row the server cannot answer for is kept, as a row that throws below is: dropping it left
          // Freshman Selectable Parking's legend with names and no symbols (#1987).
          console.warn('Could not ask the layer about a legend item, including it in the legend:', info, error);
          return of(info);
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
  private _buildLegendWhereClause(
    layer: esri.FeatureLayer,
    renderer: esri.UniqueValueRenderer,
    operableFields: string[],
    info: unknown
  ): string {
    const infoValue = (info as { value: string }).value;

    if (!infoValue) {
      return '1=1'; // Return all if no value
    }

    // A class with several values is one row whose value is all of them, joined as ArcGIS joins them
    // (#1992); a row asked about its first value alone was dropped when only another had features.
    const values = classValues(renderer, operableFields.length, infoValue) ?? [infoValue];
    const clauses = values.map((value) => this._buildValueWhereClause(layer, renderer, operableFields, value));

    return clauses.length === 1 ? clauses[0] : clauses.map((clause) => `(${clause})`).join(' OR ');
  }

  /**
   * The where clause for one renderer value: one string or number, or several fields' values joined by
   * the renderer's field delimiter.
   */
  private _buildValueWhereClause(
    layer: esri.FeatureLayer,
    renderer: esri.UniqueValueRenderer,
    operableFields: string[],
    infoValue: unknown
  ): string {
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
        } else if (typeof value === 'string' && !isNumericField(layer, field)) {
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
}

// Browser doesn't like direct esri types for inputs.
// P.S For whoever looks at this in the future and wonders what the heck is going on with
// LegendInfo and ILegendElement? I don't know. It's late, and I'm too tired to worry/care about it.
// It works. Good luck :|
type ILegendElement = esri.LegendElement;
type ILayer = esri.Layer;
type LegendInfo =
  esri.SymbolTableElementType | esri.ColorRampStop | esri.OpacityRampStop | esri.SizeRampStop | esri.HeatmapRampStop;

/** The label a legend row shows. Since ArcGIS 4.32 the typings no longer declare it on every kind of row (#1845). */
function legendInfoLabel(info: LegendInfo): unknown {
  return (info as { label?: unknown }).label;
}

/**
 * Whether the layer declares `field` with a numeric type. A multi-field unique value arrives as one
 * string (`'1,1'`), so its parts are strings whatever the field; quoting a numeric field's part makes
 * the server compare it as text, which some reject (#1988). The type is taken from the layer, not from
 * how the value looks, so a string code such as `'09400'` stays quoted. A field the layer does not
 * list is treated as a string, as before.
 */
function isNumericField(layer: esri.FeatureLayer, field: string): boolean {
  const type = layer.fields?.find((f) => f.name === field)?.type;

  return (
    type === 'small-integer' ||
    type === 'integer' ||
    type === 'big-integer' ||
    type === 'single' ||
    type === 'double' ||
    type === 'long' ||
    type === 'oid'
  );
}

/**
 * The values of the unique-value class a legend row stands for, or null when the row is not one of a
 * group's classes with several values.
 *
 * ArcGIS lists a class of `uniqueValueGroups` as one row, whose value is each of its values (its fields
 * joined by the field delimiter) joined with `', '`. That is rebuilt here for each class to find the
 * row's own, rather than splitting the row's value, which a value holding `', '` would break.
 */
function classValues(renderer: esri.UniqueValueRenderer, fieldCount: number, rowValue: unknown): string[] | null {
  for (const group of renderer.uniqueValueGroups ?? []) {
    for (const uniqueClass of group.classes ?? []) {
      const values = (uniqueClass.values ?? []).map((value) =>
        [value.value, value.value2, value.value3]
          .slice(0, Math.max(fieldCount, 1))
          .join(fieldCount > 1 ? renderer.fieldDelimiter || '' : '')
      );

      if (values.length > 1 && values.join(', ') === rowValue) {
        return values;
      }
    }
  }

  return null;
}
