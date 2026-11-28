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


  /** The map's layers as the list's view model has them; it emits a new list when a layer is added or removed. */
  private readonly items = toSignal(this.layerListService.layers(), { initialValue: [] as Array<esri.ListItem> });

  /**
   * The map's layers in its draw order, top first, as the list's view model gives them and as the legend lists the same
   * layers (#1433). It was alphabetical, so the two panels ordered the same layers differently on one screen; a map
   * that wanted its own order had to ask for it (`referenceLayerListOrder`), and the three that did asked only to agree
   * with the legend.
   */
  public readonly layers = computed(() => {
    const layers = this.items();

    return this.allowedLayerIds().length > 0
      ? layers.filter((l) => this.allowedLayerIds().includes(l.layer.id as string))
      : [...layers];
  });

  public responsive: ResponsiveSnapshot;

  public ngOnInit() {
    this.responsive = this.responsiveService.snapshot;
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
