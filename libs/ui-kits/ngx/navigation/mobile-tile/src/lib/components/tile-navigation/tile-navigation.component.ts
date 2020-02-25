import { Component, OnInit, Input, HostBinding, ContentChildren, QueryList, AfterViewInit, ViewChild } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { TileComponent } from '../tile/tile.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu.directive';
import { TileSubmenuContainerComponent } from '../tile-submenu-container/tile-submenu-container.component';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService]
})
export class TileNavigationComponent implements OnInit, AfterViewInit {
  @Input()
  public toggle: Observable<boolean>;

  public visible = true;

  @HostBinding('style.display')
  public get _visible() {
    return this.visible ? '' : 'none';
  }

  @ContentChildren(TileComponent)
  private _tiles: QueryList<TileComponent>;

  @ViewChild(TileSubmenuContainerComponent, { static: true })
  private _submenuContainer: TileSubmenuContainerComponent;

  constructor(public service: TileService) {}

  public ngOnInit() {
    if (this.toggle !== undefined) {
      this.toggle.subscribe((res) => {
        this.switchState();
      });
    } else {
      console.warn(`No toggle observable for tile navigation provided.`);
    }
  }

  public ngAfterViewInit() {
    const emitters = this._tiles.map((t: TileComponent) => t.clicked);

    merge(...emitters).subscribe((submenu: TileSubmenuDirective) => {
      this.switchSubmenuState(true);

      this._submenuContainer.container.clear();

      this._submenuContainer.container.createEmbeddedView(submenu.template);
    });
  }

  public switchState(state?: boolean) {
    this.visible = state !== undefined ? state : !this.visible;
  }

  public switchSubmenuState(state?: boolean) {
    this.service.submenuActive = state !== undefined ? state : !this.service.submenuActive;
  }
}
