import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiComponents, StrapiLocales } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [StrapiService]
})
export class HomeComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;
  public pageBody: Observable<Array<StrapiComponents>>;
  private api_url: string;

  constructor(private ss: StrapiService, private environment: EnvironmentService) {}

  ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.api_url = this.environment.value('api_url');

    this.pageContents = this.ss.getPage('home', language);
    this.pageBody = this.pageContents.pipe(pluck('body'));
  }

  ngOnDestroy() {}
}
