import { Component, ChangeDetectionStrategy, inject, input, contentChildren } from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

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
export class TileSubmenuComponent {
  private service = inject(TileService);

  public readonly title = input(this.service.activeSubMenu.pipe(pluck('title')));

  public readonly links = contentChildren(TileLinkDirective, { descendants: true });

  constructor() {
    // A click on any of the links, as they are now, closes the menu.
    toObservable(this.links)
      .pipe(
        switchMap((links) => merge(...links.map((link) => outputToObservable(link.clicked)))),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.service.toggleMenu();
      });
  }

  public close() {
    this.service.toggleSubmenu();
  }
}
