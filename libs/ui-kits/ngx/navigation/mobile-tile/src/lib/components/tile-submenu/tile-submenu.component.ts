import { Component, Input } from '@angular/core';
import { pluck } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-submenu',
  templateUrl: './tile-submenu.component.html',
  styleUrls: ['./tile-submenu.component.scss']
})
export class TileSubmenuComponent {
  @Input()
  public title = this.service.activeSubMenu.pipe(pluck('title'));

  constructor(private service: TileService) {}

  public close() {
    this.service.toggleSubmenu();
  }
}
