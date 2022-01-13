import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-found-a-bug',
  templateUrl: './found-a-bug.component.html',
  styleUrls: ['./found-a-bug.component.scss'],
  providers: [StrapiService]
})
export class FoundABugComponent implements OnInit, OnDestroy {
  private title = 'Found a Bug? | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';
  public page: StrapiSingleTypes = 'found-a-bug';
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private titleService: Title, private ss: StrapiService) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage(this.page, language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}
}
