import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-submenu',
  templateUrl: './tile-submenu.component.html',
  styleUrls: ['./tile-submenu.component.scss']
})
export class TileSubmenuComponent implements OnInit {
  @Input()
  public title = 'Sub Title';

  @Output()
  public cancelSubmenu: EventEmitter<boolean> = new EventEmitter();

  constructor(private service: TileService) {}

  public ngOnInit() {}

  public close() {
    this.service.submenuActive = false;
  }
}
