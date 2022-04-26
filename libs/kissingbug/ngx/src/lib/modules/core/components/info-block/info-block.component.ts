import { Component, Input } from '@angular/core';

import { IStrapiPageInfoBlock } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-info-block',
  templateUrl: './info-block.component.html',
  styleUrls: ['./info-block.component.scss']
})
export class InfoBlockComponent {
  @Input()
  public dataSource: IStrapiPageInfoBlock;
}
