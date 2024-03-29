import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiStapleNavigation } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @Input()
  public activePage: string;

  public contents: Observable<IStrapiStapleNavigation>;
  // TODO: Fix the template as right now the nav will disappear when you go mobile
  constructor(private ss: StrapiService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.contents = this.ss.getNavigation('navigation', language).pipe(shareReplay(1));
  }
}
