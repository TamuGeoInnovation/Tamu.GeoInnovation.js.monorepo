import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiStapleFunder } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-funder',
  templateUrl: './funder.component.html',
  styleUrls: ['./funder.component.scss']
})
export class FunderComponent implements OnInit, OnDestroy {
  public api_url = this.environment.value('api_url');
  public dataSource: Observable<IStrapiStapleFunder>;

  constructor(private environment: EnvironmentService, private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.dataSource = this.ss.getFunder('funder', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}
}
