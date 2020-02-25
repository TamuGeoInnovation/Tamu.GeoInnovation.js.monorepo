import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tile-submenu',
  templateUrl: './tile-submenu.component.html',
  styleUrls: ['./tile-submenu.component.scss']
})
export class TileSubmenuComponent implements OnInit {
  @Input()
  public title = 'Sub Title';

  constructor() {}

  public ngOnInit() {}
}
