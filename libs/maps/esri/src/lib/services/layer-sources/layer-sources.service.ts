import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import deepmerge from 'deepmerge';

import { LayerLegendOverride, LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export interface LayerSourceOverrides {
  [layerId: string]: Partial<LayerSource>;
}

@Injectable({ providedIn: 'root' })
export class LayerSourcesService {
  private _layerSources: BehaviorSubject<LayerSource[]> = new BehaviorSubject<LayerSource[]>([]);
  private _overrides: BehaviorSubject<LayerSourceOverrides> = new BehaviorSubject<LayerSourceOverrides>({});
  private _legendOverrides: Map<string, LayerLegendOverride> = new Map();

  public readonly layerSources$: Observable<LayerSource[]> = this._layerSources.asObservable();
  public readonly overrides$: Observable<LayerSourceOverrides> = this._overrides.asObservable();

  constructor(private environment: EnvironmentService) {
    this.initializeLayerSources();
  }

  /**
   * Initialize layer sources from the environment service
   */
  private initializeLayerSources(): void {
    const sources = this.environment.value('LayerSources') || [];
    this._layerSources.next(sources);
    this.collectLegendOverrides(sources);
  }

  /**
   * Walks the provided layer sources (including nested group sources) and indexes any `legend`
   * overrides so the legend component can look them up by layer id at render time.
   *
   * Event-driven sources are not part of the env-initialized list, so callers that load layers
   * dynamically (for example `EsriMapService.loadLayers`) should call this with the new sources
   * after they are loaded.
   */
  public collectLegendOverrides(sources: LayerSource[] | undefined | null): void {
    if (!sources || sources.length === 0) {
      return;
    }

    for (const source of sources) {
      if (source?.legend) {
        this._legendOverrides.set(source.id, source.legend);
      }

      const childSources = (source as unknown as { sources?: LayerSource[] })?.sources;
      if (childSources?.length) {
        this.collectLegendOverrides(childSources);
      }
    }
  }

  /**
   * Returns the `legend` override registered for a given layer id, if any.
   */
  public getLegendOverride(layerId: string | undefined | null): LayerLegendOverride | undefined {
    if (!layerId) {
      return undefined;
    }

    return this._legendOverrides.get(layerId);
  }

  /**
   * Get the current layer sources
   */
  public getLayerSources(): LayerSource[] {
    return this._layerSources.value;
  }

  /**
   * Get layer sources with applied overrides
   */
  public getLayerSourcesWithOverrides(): LayerSource[] {
    const sources = this._layerSources.value;
    const overrides = this._overrides.value;

    return sources.map((source) => {
      const override = overrides[source.id];

      if (override) {
        return deepmerge(source, override);
      }

      return source;
    });
  }

  /**
   * Set property override for a specific layer
   * @param layerId The ID of the layer to override
   * @param propertyName The name of the property to override
   * @param value The value to set for the property
   */
  public setLayerPropertyOverride(layerId: string, propertyName: string, value: unknown): void {
    const currentOverrides = this._overrides.value;
    const layerOverrides = currentOverrides[layerId] || {};

    const updatedOverrides = {
      ...currentOverrides,
      [layerId]: {
        ...layerOverrides,
        [propertyName]: value
      }
    };

    this._overrides.next(updatedOverrides);
  }

  /**
   * Set multiple property overrides for a specific layer
   * @param layerId The ID of the layer to override
   * @param overrides Object containing property overrides
   */
  public setLayerOverrides(layerId: string, overrides: Partial<LayerSource>): void {
    const currentOverrides = this._overrides.value;
    const layerOverrides = currentOverrides[layerId] || {};

    const updatedOverrides = {
      ...currentOverrides,
      [layerId]: {
        ...layerOverrides,
        ...overrides
      } as Partial<LayerSource>
    };

    this._overrides.next(updatedOverrides);
  }

  /**
   * Remove property override for a specific layer
   * @param layerId The ID of the layer
   * @param propertyName The name of the property to remove override for
   */
  public removeLayerPropertyOverride(layerId: string, propertyName: keyof LayerSource): void {
    const currentOverrides = this._overrides.value;
    const layerOverrides = currentOverrides[layerId];

    if (layerOverrides && Object.prototype.hasOwnProperty.call(layerOverrides, propertyName)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [propertyName]: _removed, ...remainingOverrides } = layerOverrides;

      const updatedOverrides = {
        ...currentOverrides,
        [layerId]: remainingOverrides
      };

      // If no overrides remain for this layer, remove the layer key entirely
      if (Object.keys(remainingOverrides).length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [layerId]: _removedLayer, ...remainingLayerOverrides } = updatedOverrides;
        this._overrides.next(remainingLayerOverrides);
      } else {
        this._overrides.next(updatedOverrides);
      }
    }
  }

  /**
   * Remove all overrides for a specific layer
   * @param layerId The ID of the layer
   */
  public removeLayerOverrides(layerId: string): void {
    const currentOverrides = this._overrides.value;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [layerId]: _removed, ...remainingOverrides } = currentOverrides;
    this._overrides.next(remainingOverrides);
  }

  /**
   * Clear all layer overrides
   */
  public clearAllOverrides(): void {
    this._overrides.next({});
  }

  /**
   * Get overrides for a specific layer
   * @param layerId The ID of the layer
   */
  public getLayerOverrides(layerId: string): Partial<LayerSource> | undefined {
    return this._overrides.value[layerId];
  }

  /**
   * Get all current overrides
   */
  public getAllOverrides(): LayerSourceOverrides {
    return this._overrides.value;
  }

  /**
   * Check if a layer has any overrides
   * @param layerId The ID of the layer
   */
  public hasLayerOverrides(layerId: string): boolean {
    const overrides = this._overrides.value[layerId];
    return overrides !== undefined && Object.keys(overrides).length > 0;
  }

  /**
   * Filter layer sources based on provided criteria
   * @param filters Optional filters to apply to the layer sources
   */
  public filterLayerSources(filters?: { params?: boolean; includeOverrides?: boolean }): LayerSource[] {
    const sources = filters?.includeOverrides ? this.getLayerSourcesWithOverrides() : this.getLayerSources();

    if (!sources || sources.length === 0) {
      console.warn('No layer sources defined in the environment. Not loading any layers.');
      return [];
    }

    // Additional filtering logic can be added here based on the filters parameter
    // For now, returning the sources as-is since filtering logic would need route information
    // which should be handled by the map service
    return sources;
  }

  /**
   * Refresh layer sources from environment service
   */
  public refreshLayerSources(): void {
    this.initializeLayerSources();
  }
}
