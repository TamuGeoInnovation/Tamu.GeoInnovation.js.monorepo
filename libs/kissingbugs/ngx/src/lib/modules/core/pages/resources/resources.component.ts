import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  providers: [StrapiService]
})
export class ResourcesComponent implements OnInit, OnDestroy {
  public page: StrapiSingleTypes = 'resources';
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('resources', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}
}
