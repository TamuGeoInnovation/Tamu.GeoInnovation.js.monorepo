import {
  Component,
  OnInit,
  ViewContainerRef,
  OnDestroy,
  inject,
  viewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-submenu-container',
  templateUrl: './tile-submenu-container.component.html',
  // Its submenuListStagger trigger staggered `.body p`, which no submenu has: it animated nothing, and went with
  // @angular/animations (#2278).
  styleUrls: ['./tile-submenu-container.component.scss']
})
export class TileSubmenuContainerComponent implements OnInit, OnDestroy {
  private service = inject(TileService);

  private readonly _container = viewChild('container', { read: ViewContainerRef });

  private _$destroy: Subject<boolean> = new Subject();

  public ngOnInit() {
    // A click even is registered on the TileComponent.
    //
    // On click, it submits it's referenced submenu template reference to the service,
    // which then emits. Here we consume the service submenu value to render
    // the submenu template reference.
    this.service.activeSubMenu.pipe(takeUntil(this._$destroy)).subscribe((res) => {
      if (res) {
        this._container().clear();

        this._container().createEmbeddedView(res.template);
      }
    });
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }
}
