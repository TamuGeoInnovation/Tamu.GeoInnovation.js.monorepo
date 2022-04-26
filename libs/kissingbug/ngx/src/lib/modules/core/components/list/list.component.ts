import { Component, Input } from '@angular/core';

import { IStrapiPageList } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  @Input()
  public dataSource: IStrapiPageList;
}
