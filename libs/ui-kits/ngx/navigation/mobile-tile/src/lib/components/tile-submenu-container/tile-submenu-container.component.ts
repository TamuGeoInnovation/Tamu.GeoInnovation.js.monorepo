import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tile-submenu-container',
  templateUrl: './tile-submenu-container.component.html',
  styleUrls: ['./tile-submenu-container.component.scss']
})
export class TileSubmenuContainerComponent implements OnInit {
  @ViewChild('container', { static: true, read: ViewContainerRef })
  public container: ViewContainerRef;

  constructor() {}

  public ngOnInit() {}
}
