import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy, HostBinding } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';
import { tileStaggerAnimation } from '../../animations/animations';

@Component({
  selector: 'tamu-gisc-tile-submenu-container',
  templateUrl: './tile-submenu-container.component.html',
  styleUrls: ['./tile-submenu-container.component.scss'],
  // Queries the view-entering sub-menu items and staggers them in.
  // This animation apparently needs to be in a parent component, and not
  // in the self-component otherwise it can't query anything entering into view
  // because the whole thing is entering into view.
  animations: [tileStaggerAnimation]
})
export class TileSubmenuContainerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true, read: ViewContainerRef })
  private _container: ViewContainerRef;

  private _$destroy: Subject<boolean> = new Subject();

  // Bind the animation to the host component
  @HostBinding('@tileStaggerAnimation')
  private _animation() {
    return true;
  }

  constructor(private service: TileService) {}

  public ngOnInit() {
    // A click even is registered on the TileComponent.
    //
    // On click, it submits it's referenced submenu template reference to the service,
    // which then emits. Here we consume the service submenu value to render
    // the submenu template reference.
    this.service.activeSubMenu.pipe(takeUntil(this._$destroy)).subscribe((res) => {
      if (res) {
        this._container.clear();

        this._container.createEmbeddedView(res.template);
      }
    });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
