import { AfterContentInit, Component, HostListener, OnDestroy, inject, contentChild } from '@angular/core';
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
  imports: [TileNavigationComponent],
  // The tile itself is the link or button, for the keyboard and screen readers as for a tap (#2588): one tab stop, named
  // by its title, with Enter (and Space for a submenu) doing what a tap does. A tile with neither stays inert.
  host: {
    '[attr.tabindex]': 'submenu() || link() ? 0 : null',
    '[attr.role]': "submenu() ? 'button' : link() ? 'link' : null",
    '(keydown.enter)': '_activate($event)',
    '(keydown.space)': 'submenu() && _activate($event)'
  }
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

  @HostListener('click', ['$event'])
  protected _tileClick(event?: Event) {
    const submenu = this.submenu();
    const link = this.link();

    if (submenu) {
      this.service.updateSubmenu({
        template: submenu.template,
        title: this.title().title
      });

      this.service.toggleSubmenu(true);
    } else if (link && !link.contains((event?.target as Node) ?? null)) {
      // A tap on the tile's icon or padding follows its link, as a tap on its title does (#3198).
      link.follow();
    }
  }

  protected _activate(event: Event) {
    event.preventDefault();
    this._tileClick(event);
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
