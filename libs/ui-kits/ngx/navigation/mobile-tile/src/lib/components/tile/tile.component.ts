import { AfterContentInit, Component, ContentChild, HostListener, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu/tile-submenu.directive';
import { TileService } from '../../services/tile.service';
import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';

@Component({
  selector: 'tamu-gisc-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements AfterContentInit, OnDestroy {
  private _destroy$: Subject<boolean> = new Subject();

  @ContentChild(TileTitleComponent, { static: true })
  public title: TileTitleComponent;

  // A tile can redirect to open a submenu. Need a reference to the submenu template to render it.
  @ContentChild(TileSubmenuDirective, { static: true })
  public submenu: TileSubmenuDirective;

  // A tile can have a link directive to link directly to a location. Need a reference to the link directive
  // to subscribe to its click event and toggle the menu.
  @ContentChild(TileLinkDirective)
  public link: TileLinkDirective;

  @HostListener('click')
  private _tileClick() {
    if (this.submenu) {
      this.service.updateSubmenu({
        template: this.submenu.template,
        title: this.title.title
      });

      this.service.toggleSubmenu(true);
    }
  }

  constructor(private service: TileService) {}

  public ngAfterContentInit(): void {
    if (this.link) {
      this.link.clicked.pipe(takeUntil(this._destroy$)).subscribe(() => {
        this.service.toggleMenu(false);
      });
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
