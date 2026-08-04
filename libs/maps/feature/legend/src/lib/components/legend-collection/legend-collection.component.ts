import { Component, Input } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-collection',
  templateUrl: './legend-collection.component.html',
  styleUrls: ['./legend-collection.component.scss']
})
export class LegendCollectionComponent {
  @Input()
  public group: IActiveLayerInfo;

  @Input()
  public layer: ILayer;

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicate = false;

  @Input()
  public respectDefinitionExpression = false;

  @Input()
  public allowVisibilityToggle = false;

  @Input()
  public combineChildrenUnderPrimary = false;

  @Input()
  public hideElementGroupHeaders = false;

  public expanded = true;

  private readonly _sportsSafetyFirstLayerIds = new Set([
    'softball-parking-safety-first',
    'swimming-parking-safety-first',
    'soccer-parking-safety-first',
    'volleyball-parking-safety-first',
    'indoor-track-parking-safety-first',
    'outdoor-track-parking-safety-first'
  ]);

  public get childGroups(): IActiveLayerInfo[] {
    const children = this._toArray<IActiveLayerInfo>(this.group?.children);

    if (!this.combineChildrenUnderPrimary || !this._isPhysicsFestivalGroup(this.group?.layer?.id)) {
      return children;
    }

    return children
      .map((child, index) => ({
        child,
        index,
        priority: this._getPhysicsFestivalChildPriority(child?.title)
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        return a.index - b.index;
      })
      .map(({ child }) => child);
  }

  public get legendElements(): esri.LegendElement[] {
    return this._toArray<esri.LegendElement>(this.group?.legendElements);
  }

  public get visibleChildGroups(): IActiveLayerInfo[] {
    if (this._shouldHideSportsSafetyFirstChildGroups()) {
      return [];
    }

    return this.childGroups;
  }

  public get hasChildren(): boolean {
    return this.visibleChildGroups.length > 0;
  }

  public get childHideElementGroupHeaders(): boolean {
    if (
      this.combineChildrenUnderPrimary &&
      this.hasChildren &&
      this._isPhysicsFestivalGroup(this.group?.layer?.id)
    ) {
      return true;
    }

    return this.hideElementGroupHeaders;
  }

  /**
   * When a leaf collection (no child groups) already displays its own title as a
   * visibility-toggle header, the legend-element group header would repeat that same
   * label. Suppress it so each label appears only once.
   */
  public get hideLeafElementGroupHeaders(): boolean {
    return this.showGroupTitle && !this.hasChildren;
  }

  public toggleExpanded(): void {
    if (!this.hasChildren && !this.allowVisibilityToggle) {
      return;
    }

    if (this.allowVisibilityToggle && this.group?.layer) {
      this.group.layer.visible = !this.isLayerVisible;
    } else {
      this.expanded = !this.expanded;
    }
  }

  public get isLayerVisible(): boolean {
    return this.group?.layer?.visible ?? true;
  }

  public get isExpanded(): boolean {
    if (this.allowVisibilityToggle && this.group?.layer) {
      return this.isLayerVisible;
    }

    return this.expanded;
  }

  /**
   * Function used to track legend elements in the ngFor loop to prevent unnecessary re-renders.
   *
   * This is particularly important because nested LegendElements perform async network operations
   * on component init.
   */
  public trackByLegendElement(index: number, el: esri.LegendElement): string {
    const identifier = el?.infos ? el.infos?.map((i) => `${i.label}-${i.value}`).join(',') : null;

    return identifier ?? `${index}`;
  }

  public trackByLegendGroup(index: number, group: IActiveLayerInfo): string {
    return `${group?.layer?.id || 'layer'}-${group?.title || index}`;
  }

  private _toArray<T>(collection: unknown): T[] {
    if (!collection) {
      return [];
    }

    if (Array.isArray(collection)) {
      return collection as T[];
    }

    const collectionAsObject = collection as { toArray?: () => T[]; length?: number; getItemAt?: (index: number) => T };

    if (typeof collectionAsObject.toArray === 'function') {
      return collectionAsObject.toArray();
    }

    if (typeof collectionAsObject.length === 'number' && typeof collectionAsObject.getItemAt === 'function') {
      const getItemAt = collectionAsObject.getItemAt;

      return Array.from({ length: collectionAsObject.length }, (_, index) => getItemAt(index));
    }

    return [];
  }

  private _isPhysicsFestivalGroup(layerId?: string): boolean {
    return layerId?.startsWith('phys-eng-festival-') ?? false;
  }

  public get showGroupTitle(): boolean {
    if (this._sportsSafetyFirstLayerIds.has(this.group?.layer?.id)) {
      return false;
    }

    if (this.hasChildren) {
      return true;
    }

    // Also show a clickable title for leaf layers when visibility toggling is enabled
    // and child headers are not suppressed (e.g. Physics Fest combine-under-primary mode)
    return this.allowVisibilityToggle && !this.hideElementGroupHeaders && !!this.group?.layer;
  }

  private _shouldHideSportsSafetyFirstChildGroups(): boolean {
    return this._sportsSafetyFirstLayerIds.has(this.group?.layer?.id) && this.legendElements.length > 0 && this.childGroups.length > 0;
  }

  private _getPhysicsFestivalChildPriority(title?: string): number {
    const normalizedTitle = title?.toLowerCase() ?? '';

    if (normalizedTitle.includes('drop off') || normalizedTitle.includes('dropoff') || normalizedTitle.includes('pick up')) {
      return 1;
    }

    if (normalizedTitle.includes('route') || normalizedTitle.includes('path')) {
      return 2;
    }

    return 0;
  }
}

// Browser doesn't like direct esri types for inputs.
type IActiveLayerInfo = esri.ActiveLayerInfo;
type ILayer = esri.Layer;
