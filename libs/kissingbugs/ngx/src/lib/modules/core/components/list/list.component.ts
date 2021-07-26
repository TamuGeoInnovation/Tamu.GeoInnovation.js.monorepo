import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { IStrapiPageList } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageList;

  constructor() {}

  public ngOnInit(): void {}

  public ngOnDestroy(): void {}
}
