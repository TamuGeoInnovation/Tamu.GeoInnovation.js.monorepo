import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LayerListService } from '../../services/layer-list.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss']
})
export class LayerListComponent implements OnInit {
  public layers: Observable<Array<esri.ListItem>> = this.layerListService.layers();

  public responsive: ResponsiveSnapshot;

  constructor(
    private layerListService: LayerListService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.responsive = this.responsiveService.snapshot;
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
