import { Component, OnInit, ContentChild, HostListener, EventEmitter, Output } from '@angular/core';

import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu.directive';

@Component({
  selector: 'tamu-gisc-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Output()
  public clicked: EventEmitter<TileSubmenuDirective> = new EventEmitter();

  @ContentChild(TileTitleComponent, { static: true })
  public title: TileTitleComponent;

  @ContentChild(TileSubmenuDirective, { static: true })
  public submenu: TileSubmenuDirective;

  @HostListener('click')
  private _tileClick(event) {
    if (this.submenu) {
      this.clicked.emit(this.submenu);
    }
  }

  constructor() {}

  public ngOnInit() {}
}
