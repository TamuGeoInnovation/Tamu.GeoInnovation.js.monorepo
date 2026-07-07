import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LayerListService } from '../../services/layer-list.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss']
})
export class LayerListComponent implements OnInit {
  @Input() public allowedLayerIds: string[] = [];

  /**
   * How to order the rendered list.
   *
   * - `title` (default): alphabetical by layer title.
   * - `allowed`: follows the order of `allowedLayerIds` so the list can match an external draw
   *   order (e.g. the legend). Falls back to `title` ordering for any layer not in the list.
   */
  @Input() public orderBy: 'title' | 'allowed' = 'title';

  public layers: Observable<Array<esri.ListItem>>;

  public responsive: ResponsiveSnapshot;

  constructor(
    private layerListService: LayerListService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.responsive = this.responsiveService.snapshot;
    this.layers = this.layerListService.layers().pipe(
      map((layers) => {
        const filtered =
          this.allowedLayerIds.length > 0 ? layers.filter((l) => this.allowedLayerIds.includes(l.layer.id)) : layers;

        if (this.orderBy === 'allowed' && this.allowedLayerIds.length > 0) {
          // `filtered` only contains allowed ids here, so order by their position in the list to
          // match an external draw order (e.g. the legend).
          return filtered.sort((a, b) => this.allowedLayerIds.indexOf(a.layer.id) - this.allowedLayerIds.indexOf(b.layer.id));
        }

        // Order layers by title
        // TODO: This is potentially problematic because layer lists are inherently supposed to be ordered by the order of the layers in the map.
        // However, we can't apply the order of the layers in the map because certain layers need to be at the top of the list due to rendering conflicts (occlusion, etc.)
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      })
    );
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
