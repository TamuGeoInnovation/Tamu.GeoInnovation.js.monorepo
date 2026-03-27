import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LayerListService } from '../../services/layer-list.service';


@Component({
  selector: 'tamu-gisc-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss']
})
export class LayerListComponent implements OnInit {
  public layers: Observable<Array<__esri.ListItem>>;

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
      // Order layers by title
      // TODO: This is potentially problematic because layer lists are inherently supposed to be ordered by the order of the layers in the map.
      // However, we can't apply the order of the layers in the map because certain layers need to be at the top of the list due to rendering conflicts (occlusion, etc.)
      map((layers) => layers.sort((a, b) => a.title.localeCompare(b.title)))
    );
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
