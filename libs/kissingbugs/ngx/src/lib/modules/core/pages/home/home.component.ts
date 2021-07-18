import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, IStrapiComponent } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [StrapiService]
})
export class HomeComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;
  public pageBody: Observable<Array<IStrapiComponent>>;

  constructor(private ss: StrapiService, private environment: EnvironmentService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    // TOOD: remove this? Why is it here again?
    const url = this.environment.value('api_url');

    this.pageContents = this.ss.getPage('home', language);
    this.pageBody = this.pageContents.pipe(pluck('body'));

    this.pageBody.subscribe((body: Array<IStrapiComponent>) => {
      body.forEach((component: IStrapiComponent) => {
        this.renderInnerComponent(component);
      });
    });
  }

  public ngOnDestroy() {}

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
