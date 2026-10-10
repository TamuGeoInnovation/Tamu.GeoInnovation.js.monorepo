import { AfterContentInit, Component, ContentChildren, Input, OnDestroy, QueryList, ChangeDetectionStrategy, inject } from '@angular/core';
import { from, merge, Subject } from 'rxjs';
import { mergeMap, pluck, switchMap, takeUntil } from 'rxjs/operators';

import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';
import { TileService } from '../../services/tile.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-tile-submenu',
  templateUrl: './tile-submenu.component.html',
  styleUrls: ['./tile-submenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe]
})
export class TileSubmenuComponent implements AfterContentInit, OnDestroy {
  private service = inject(TileService);

  @Input()
  public title = this.service.activeSubMenu.pipe(pluck('title'));

  @ContentChildren(TileLinkDirective, { descendants: true })
  public links: QueryList<TileLinkDirective>;

  private _destroy$: Subject<null> = new Subject();

  public ngAfterContentInit(): void {
    merge(
      from(this.links.toArray()),
      this.links.changes.pipe(
        switchMap((links) => {
          return from(links.toArray());
        })
      )
    )
      .pipe(
        mergeMap((link: TileLinkDirective) => {
          return link.clicked;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.service.toggleMenu();
      });
  }

  public ngOnDestroy() {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  public close() {
    this.service.toggleSubmenu();
  }
}
