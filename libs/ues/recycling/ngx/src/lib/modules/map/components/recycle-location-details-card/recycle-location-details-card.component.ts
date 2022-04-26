import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { RecyclingLocationMetadata, RecyclingService } from '../../../core/services/recycling.service';

@Component({
  selector: 'tamu-gisc-recycle-location-details-card',
  templateUrl: './recycle-location-details-card.component.html',
  styleUrls: ['./recycle-location-details-card.component.scss']
})
export class RecycleLocationDetailsCardComponent {
  public selectedMetadata: Observable<RecyclingLocationMetadata> = this.recyclingService.selectedLocationMeta;

  constructor(private recyclingService: RecyclingService) {}
}
