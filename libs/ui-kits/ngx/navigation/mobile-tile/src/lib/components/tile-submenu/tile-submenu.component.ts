import { AfterContentInit, Component, ContentChildren, Input, OnDestroy, QueryList } from '@angular/core';
import { from, Subject } from 'rxjs';
import { mergeMap, pluck, takeUntil } from 'rxjs/operators';

import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-submenu',
  templateUrl: './tile-submenu.component.html',
  styleUrls: ['./tile-submenu.component.scss']
})
export class TileSubmenuComponent implements AfterContentInit, OnDestroy {
  @Input()
  public title = this.service.activeSubMenu.pipe(pluck('title'));

  @ContentChildren(TileLinkDirective)
  public links: QueryList<TileLinkDirective>;

  private _destroy$: Subject<null> = new Subject();

  constructor(private service: TileService) {}

  public ngAfterContentInit(): void {
    from(this.links.toArray())
      .pipe(
        mergeMap((link: TileLinkDirective) => {
          return link.clicked;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe((linkClicked) => {
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
