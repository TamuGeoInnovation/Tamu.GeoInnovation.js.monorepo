import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, IStrapiComponent } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [StrapiService]
})
export class HomeComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('home', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}

  // TODO: Remove; not needed. Was over thinking.
  public renderInnerComponent(parent: IStrapiComponent) {
    // 1. Get properties
    const props = Object.getOwnPropertyNames(parent);
    // 2. Iterate through them
    props.forEach((prop) => {
      // 3. Test if property is of type {} or StrapiComponent
      const x = parent[prop];
      if (typeof x === 'object') {
        // 3a. If it is a StrapiComponent call this.renderInnerComponent()
        // this.renderInnerComponent(x);
        // console.log('x is an object', x);
        if (x != null || x != undefined) {
          this.renderInnerComponent(x);
        }
      } else {
        // 3b. Render the component since it doesn't have any nested components
      }
      // 4. If property is not of StrapiComponent move on to
    });
  }
}
