import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, map, pipe, shareReplay, withLatestFrom } from 'rxjs';

import { PaginationEvent } from '../../types/pagination.types';

@Component({
  selector: 'tamu-gisc-table-paginator',
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss']
})
export class TablePaginatorComponent implements OnInit, OnChanges {
  @Input()
  public total: number;

  @Input()
  public pageSize = 100;

  @Input()
  public showLimitArrows = true;

  /**
   * Shows result counter in the paginator.
   *
   * e.g. 1 - 100 of 1000
   */
  @Input()
  public showResultCounter = true;

  @Output()
  public pagination: EventEmitter<PaginationEvent> = new EventEmitter();

  public currentPage = 1;

  private _pageState$: BehaviorSubject<PaginationState>;
  public pageState: Observable<PaginationState>;
  public nextPages: Observable<Array<number>>;
  public previousPages: Observable<Array<number>>;
  public showStartLimit: Observable<boolean>;
  public showEndLimit: Observable<boolean>;
  public pageBoundaries: Observable<PageBoundaries>;

  public ngOnInit(): void {
    this._pageState$ = new BehaviorSubject({
      page: this.currentPage,
      pageSize: this.pageSize,
      total: this.total,
      limitPage: this.total !== undefined && this.pageSize !== undefined ? Math.ceil(this.total / this.pageSize) : 0
    });

    this.pageState = this._pageState$.asObservable().pipe(shareReplay(1));

    this.nextPages = this.pageState.pipe(this._getNextPages(2), shareReplay());

    this.previousPages = this.pageState.pipe(this._getPreviousPages(2), shareReplay());

    this.showStartLimit = this.previousPages.pipe(
      withLatestFrom(this.pageState),
      map(([previousPages]) => {
        // Only show the start limit when we are more than two pages away from the start.
        return previousPages.length > 1 && previousPages.includes(1) === false;
      })
    );

    this.showEndLimit = this.nextPages.pipe(
      withLatestFrom(this.pageState),
      map(([nextPages, state]) => {
        return nextPages.length > 1 && nextPages.includes(state.limitPage) === false;
      })
    );

    this.pageBoundaries = this.pageState.pipe(
      map((state) => {
        return {
          start: (state.page - 1) * state.pageSize + 1,
          end: state.page * state.pageSize <= state.total ? state.page * state.pageSize : state.total
        };
      })
    );

    this._pageState$.subscribe((v) => this.pagination.emit(v));
  }

  public ngOnChanges(changes: SimpleChanges) {
    // Total value can be async, so we need to check for changes and update the state accordingly.
    if (changes && changes['total'] && changes['total'].currentValue) {
      const state = this._pageState$.getValue();

      this._pageState$.next({
        ...state,
        total: changes['total'].currentValue,
        limitPage: Math.ceil(changes['total'].currentValue / state.pageSize)
      });
    }
  }

  public goNextPage() {
    const s = this._pageState$.getValue();

    if (s.page < Math.ceil(s.total / s.pageSize)) {
      this._pageState$.next({ ...this._pageState$.getValue(), page: s.page + 1 });
    } else {
      console.log('Cannot go to next page. Already at end of sequence.');
    }
  }

  public goPreviousPage() {
    const s = this._pageState$.getValue();

    if (s.page > 1) {
      this._pageState$.next({ ...this._pageState$.getValue(), page: s.page - 1 });
    } else {
      console.log('Cannot go to previous page. Already at start of sequence.');
    }
  }

  public goFirstPage() {
    const s = this._pageState$.getValue();

    if (s.page > 1) {
      this._pageState$.next({ ...this._pageState$.getValue(), page: 1 });
    } else {
      console.log('Cannot go to first page. Already at start of sequence.');
    }
  }

  public goLastPage() {
    const s = this._pageState$.getValue();

    if (s.page < s.limitPage) {
      this._pageState$.next({ ...this._pageState$.getValue(), page: s.limitPage });
    } else {
      console.log('Cannot go to last page. Already at end of sequence.');
    }
  }

  public goToPage(n: number) {
    this._pageState$.next({ ...this._pageState$.getValue(), page: n });
  }

  private _getNextPages(n: number) {
    return pipe(
      map((state: PaginationState) => {
        const nextPages = [];

        for (let i = state.page + 1; i <= state.limitPage; i++) {
          nextPages.push(i);
        }

        return nextPages.splice(0, n);
      })
    );
  }

  private _getPreviousPages(n: number) {
    return pipe(
      map((state: PaginationState) => {
        const previousPages = [];

        for (let i = state.page - 1; i > 0; i--) {
          previousPages.push(i);
        }

        return previousPages.splice(0, n).reverse();
      })
    );
  }
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;

  /**
   * The last page number given the current page size and total.
   */
  limitPage: number;
}

interface PageBoundaries {
  start: number;
  end: number;
}
