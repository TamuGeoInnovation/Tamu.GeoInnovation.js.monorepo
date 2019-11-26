import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { switchMap, filter, toArray, shareReplay } from 'rxjs/operators';

import { SitesService } from './services/sites/sites.service';

@Component({
  selector: 'tamu-gisc-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
  public sites = this.s.getData().pipe(
    switchMap((sites) => {
      return from(sites);
    }),
    filter((site) => {
      return site.enabled === true;
    }),
    toArray(),
    shareReplay(1)
  );

  constructor(private s: SitesService) {}

  public ngOnInit() {}
}
