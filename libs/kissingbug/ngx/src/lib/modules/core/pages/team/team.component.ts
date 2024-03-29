import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  providers: [StrapiService]
})
export class TeamComponent implements OnInit {
  private title = 'Meet the Team | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';
  public page: StrapiSingleTypes = 'team';
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private titleService: Title, private ss: StrapiService) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage(this.page, language).pipe(shareReplay(1));
  }
}
