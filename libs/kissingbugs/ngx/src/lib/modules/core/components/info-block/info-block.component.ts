import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { IStrapiPageInfoBlock } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-info-block',
  templateUrl: './info-block.component.html',
  styleUrls: ['./info-block.component.scss']
})
export class InfoBlockComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageInfoBlock;

  constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
