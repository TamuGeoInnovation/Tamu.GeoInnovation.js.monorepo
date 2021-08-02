import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-single-type',
  templateUrl: './single-type.component.html',
  styleUrls: ['./single-type.component.scss'],
  providers: [StrapiService]
})
export class SingleTypeComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private route: ActivatedRoute, private ss: StrapiService) {}

  public ngOnInit() {
    if (this.route.snapshot.params['guid']) {
    }
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('home-new', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}
}
