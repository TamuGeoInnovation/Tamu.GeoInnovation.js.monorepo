import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiStapleFooter } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public api_url = this.environment.value('api_url');
  public dataSource: Observable<IStrapiStapleFooter>;

  constructor(private environment: EnvironmentService, private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.dataSource = this.ss.getFooter('footer', language).pipe(shareReplay(1));
  }
}
