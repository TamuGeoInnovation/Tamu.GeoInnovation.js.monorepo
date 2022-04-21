import { Component, Input } from '@angular/core';

import { IStrapiPageSection } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent {
  @Input()
  public dataSource: IStrapiPageSection;
}
