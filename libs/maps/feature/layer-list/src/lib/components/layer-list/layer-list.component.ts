import { Component, OnInit, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LayerListService } from '../../services/layer-list.service';
import { LayerListItemComponent } from '../layer-list-item/layer-list-item.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
  imports: [LayerListItemComponent]
})
export class LayerListComponent implements OnInit {
  private layerListService = inject(LayerListService);
  private responsiveService = inject(ResponsiveService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public readonly allowedLayerIds = input<string[]>([]);

  /**
   * How to order the rendered list.
   *
   * - `title` (default): alphabetical by layer title.
   * - `allowed`: follows the order of `allowedLayerIds` so the list can match an external draw
   *   order (e.g. the legend). Falls back to `title` ordering for any layer not in the list.
   */
  public readonly orderBy = input<'title' | 'allowed'>('title');

  /** The map's layers as the list's view model has them; it emits a new list when a layer is added or removed. */
  private readonly items = toSignal(this.layerListService.layers(), { initialValue: [] as Array<esri.ListItem> });

  public readonly layers = computed(() => {
    const layers = this.items();
    const filtered =
      this.allowedLayerIds().length > 0 ? layers.filter((l) => this.allowedLayerIds().includes(l.layer.id as string)) : [...layers];

    if (this.orderBy() === 'allowed' && this.allowedLayerIds().length > 0) {
      // `filtered` only contains allowed ids here, so order by their position in the list to
      // match an external draw order (e.g. the legend).
      return filtered.sort(
        (a, b) => this.allowedLayerIds().indexOf(a.layer.id as string) - this.allowedLayerIds().indexOf(b.layer.id as string)
      );
    }

    // Order layers by title
    // TODO: This is potentially problematic because layer lists are inherently supposed to be ordered by the order of the layers in the map.
    // However, we can't apply the order of the layers in the map because certain layers need to be at the top of the list due to rendering conflicts (occlusion, etc.)
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  });

  public responsive: ResponsiveSnapshot;

  public ngOnInit() {
    this.responsive = this.responsiveService.snapshot;
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
