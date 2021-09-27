import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, reduce, shareReplay, switchMap } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  providers: [StrapiService]
})
export class TeamComponent implements OnInit, OnDestroy {
  public page: StrapiSingleTypes = 'team';
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('team', language).pipe(shareReplay(1));

    // this.pageContents
    //   .pipe(
    //     map((response) => {
    //       const sections = Object.keys(response).filter((value) => value.includes('section'));
    //       return sections.map((key) => {
    //         return response[key];
    //       });
    //     })
    //   )
    //   .subscribe((response) => {
    //     console.log(response);
    //   });
  }

  public ngOnDestroy() {}
}
