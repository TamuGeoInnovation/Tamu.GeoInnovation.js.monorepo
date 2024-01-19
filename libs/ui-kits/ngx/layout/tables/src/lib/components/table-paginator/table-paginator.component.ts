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
    this._broadcast();
  }

  public goNextPage() {
    if (this.currentPage < Math.ceil(this.total / this.pageSize)) {
      this.currentPage++;

      this._broadcast();
    } else {
      console.log('Cannot go to next page. Already at end of sequence.');
    }
  }

  public goPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;

      this._broadcast();
    } else {
      console.log('Cannot go to previous page. Already at start of sequence.');
    }
  }

  public goFirstPage() {
    if (this.currentPage > 1) {
      this.currentPage = 1;

      this._broadcast();
    } else {
      console.log('Cannot go to first page. Already at start of sequence.');
    }
  }

  public goLastPage() {
    const limit = Math.ceil(this.total / this.pageSize);

    if (this.currentPage < limit) {
      this.currentPage = limit;
      this._broadcast();
    } else {
      console.log('Cannot go to last page. Already at end of sequence.');
    }
  }

  private _broadcast() {
    this.pagination.emit({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }
}
