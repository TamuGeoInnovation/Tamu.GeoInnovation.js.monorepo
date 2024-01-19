import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PaginationEvent } from '../../types/pagination.types';

@Component({
  selector: 'tamu-gisc-table-paginator',
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss']
})
export class TablePaginatorComponent implements OnInit {
  @Input()
  public total: number;

  @Input()
  public pageSize = 100;

  @Output()
  public pagination: EventEmitter<PaginationEvent> = new EventEmitter();

  public currentPage = 1;

  public ngOnInit(): void {
    this.goFirstPage();
  }

  public broadcastPage(eventProps: PaginationEvent) {
    this.pagination.emit(eventProps);
  }

  public goNextPage() {
    this.currentPage++;
    this.broadcastPage({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  public goPreviousPage() {
    this.currentPage--;
    this.broadcastPage({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  public goFirstPage() {
    this.currentPage = 1;
    this.broadcastPage({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  public goLastPage() {
    this.currentPage = Math.ceil(this.total / this.pageSize);
    this.broadcastPage({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }
}
