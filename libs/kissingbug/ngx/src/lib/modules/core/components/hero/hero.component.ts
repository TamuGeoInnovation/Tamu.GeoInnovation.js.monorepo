import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiStapleHero } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  @Input()
  public dataSource: IStrapiStapleHero;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
