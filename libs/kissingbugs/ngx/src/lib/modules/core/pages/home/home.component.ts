import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiComponents } from '../../types/types';

@Component({
  selector: 'tamu-gisc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [StrapiService]
})
export class HomeComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;
  public pageBody: Observable<Array<StrapiComponents>>;

  constructor(private ss: StrapiService) {}

  ngOnInit() {
    this.pageContents = this.ss.getPage('home', 'es');
    this.pageBody = this.pageContents.pipe(pluck('body'));

    // this.pageBody.subscribe((results) => {
    //   console.log(results);
    // });
  }

  ngOnDestroy() {}
}
