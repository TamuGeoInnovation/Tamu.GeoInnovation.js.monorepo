import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-found-a-bug',
  templateUrl: './found-a-bug.component.html',
  styleUrls: ['./found-a-bug.component.scss'],
  providers: [StrapiService]
})
export class FoundABugComponent implements OnInit, OnDestroy {
  public page: StrapiSingleTypes = 'found-a-bug';
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage(this.page, language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}
}
