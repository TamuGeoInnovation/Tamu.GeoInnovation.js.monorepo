import { Component, OnInit, ContentChild, HostListener } from '@angular/core';

import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu.directive';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @ContentChild(TileTitleComponent, { static: true })
  public title: TileTitleComponent;

  @ContentChild(TileSubmenuDirective, { static: true })
  public submenu: TileSubmenuDirective;

  @HostListener('click')
  private _tileClick(event) {
    if (this.submenu) {
      this.service.updateSubmenu({
        template: this.submenu.template,
        title: this.title.title
      });
    }
  }

  constructor(private service: TileService) {}

  public ngOnInit() {}
}
