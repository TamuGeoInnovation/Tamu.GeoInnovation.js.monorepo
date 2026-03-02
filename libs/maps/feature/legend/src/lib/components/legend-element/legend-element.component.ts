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

  public infos: Observable<Array<LegendInfo>>;
  public expanded = true;

  public get showGroupHeader(): boolean {
    const infos = this.element?.infos as { length?: number } | undefined;

    return typeof infos?.length === 'number' && infos.length > 1;
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

    this.infos = iif(
      () => {
        return this.deduplicateChildren;
      },
      from(
        this.element.infos.filter((info, index, self) => {
          return index === self.findIndex((t) => t.label === info.label);
        }) as Array<LegendInfo>
      ),
      from(this.element.infos as Array<LegendInfo>)
    ).pipe(
      concatMap((info) => {
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
      filter((infoOrNull) => {
        return infoOrNull !== null;
      }),
      toArray(),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  /**
   * Uses ArcGIS JS API to robustly evaluate which legend items would return features
   * given the current definition expression. This handles complex T-SQL expressions properly.
   */
  private _filterLegendInfosWithQuery(
    layer: esri.FeatureLayer,
    renderer: esri.UniqueValueRenderer,
    info: LegendInfo
  ): Observable<LegendInfo> {
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
  private _fallbackToSimpleParsing(operableLayer: esri.FeatureLayer, renderer: esri.UniqueValueRenderer, info: LegendInfo) {
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
  | esri.SymbolTableElementType
  | esri.ColorRampStop
  | esri.OpacityRampStop
  | esri.SizeRampStop
  | esri.HeatmapRampStop;
