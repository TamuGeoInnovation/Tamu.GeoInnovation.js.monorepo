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

  public expanded = true;

  public get childGroups(): IActiveLayerInfo[] {
    return this._toArray<IActiveLayerInfo>(this.group?.children);
  }

  public get legendElements(): esri.LegendElement[] {
    return this._toArray<esri.LegendElement>(this.group?.legendElements);
  }

  public get hasChildren(): boolean {
    return this.childGroups.length > 0;
  }

  public toggleExpanded(): void {
    if (!this.hasChildren) {
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
    if (this.allowVisibilityToggle && this.hasChildren) {
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

    return identifier;
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
      return Array.from({ length: collectionAsObject.length }, (_, index) => collectionAsObject.getItemAt(index));
    }

    return [];
  }
}

// Browser doesn't like direct esri types for inputs.
type IActiveLayerInfo = esri.ActiveLayerInfo;
type ILayer = esri.Layer;
