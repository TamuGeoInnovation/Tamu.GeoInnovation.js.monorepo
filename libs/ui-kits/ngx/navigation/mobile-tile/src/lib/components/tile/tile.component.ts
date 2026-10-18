import {
  AfterContentInit,
  Component,
  HostListener,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  contentChild
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu/tile-submenu.directive';
import { TileService } from '../../services/tile.service';
import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';
import { TileNavigationComponent } from '../tile-navigation/tile-navigation.component';

@Component({
  selector: 'tamu-gisc-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TileNavigationComponent]
})
export class TileComponent implements AfterContentInit, OnDestroy {
  private service = inject(TileService);

  private _destroy$: Subject<boolean> = new Subject();

  public readonly title = contentChild(TileTitleComponent);

  // A tile can redirect to open a submenu. Need a reference to the submenu template to render it.
  public readonly submenu = contentChild(TileSubmenuDirective);

  // A tile can have a link directive to link directly to a location. Need a reference to the link directive
  // to subscribe to its click event and toggle the menu.
  public readonly link = contentChild(TileLinkDirective);

  @HostListener('click')
  protected _tileClick() {
    const submenu = this.submenu();
    if (submenu) {
      this.service.updateSubmenu({
        template: submenu.template,
        title: this.title().title
      });

      this.service.toggleSubmenu(true);
    }
  }

  public ngAfterContentInit(): void {
    const link = this.link();
    if (link) {
      outputToObservable(link.clicked)
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => {
          this.service.toggleMenu(false);
        });
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
