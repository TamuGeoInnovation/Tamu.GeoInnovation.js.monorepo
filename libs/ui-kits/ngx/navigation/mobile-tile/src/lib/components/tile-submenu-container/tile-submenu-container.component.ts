import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-submenu-container',
  templateUrl: './tile-submenu-container.component.html',
  styleUrls: ['./tile-submenu-container.component.scss']
})
export class TileSubmenuContainerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true, read: ViewContainerRef })
  public container: ViewContainerRef;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private service: TileService) {}

  public ngOnInit() {
    // A click even is registered on the TileComponent.
    //
    // On click, it submits it's referenced submenu template reference to the service,
    // which then emits. Here we consume the service submenu value to render
    // the submenu template reference.
    this.service.activeSubMenu.pipe(takeUntil(this._$destroy)).subscribe((res) => {
      if (res) {
        this.container.clear();

        this.container.createEmbeddedView(res.template);
      }
    });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
