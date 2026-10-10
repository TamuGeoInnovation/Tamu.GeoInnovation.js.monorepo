import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { SignageService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-signage',
  templateUrl: './signage.component.html',
  styleUrls: ['./signage.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MapboxMapComponent, AccordionComponent, AccordionHeaderComponent, AccordionContentComponent]
})
export class SignageComponent implements OnInit {
  private mapService = inject(MapboxMapService);
  private signageService = inject(SignageService);

  public ngOnInit(): void {
    // TODO: Finish this -Aaron (1/5/2021)
    this.mapService.loaded.subscribe((map) => {
      const signage = this.signageService.getSignage();
      signage.subscribe((result) => {
        console.log(result);
      });
      map.addSource('cases', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.covid'
      });
    });
  }
}
