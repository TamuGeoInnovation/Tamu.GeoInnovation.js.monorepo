import { Component, OnInit, Input, HostBinding, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import { TileSubmenuContainerComponent } from '../tile-submenu-container/tile-submenu-container.component';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService]
})
export class TileNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public toggle: Observable<boolean>;

  private menuVisible: boolean;

  @HostBinding('style.display')
  public get _visible() {
    return this.menuVisible ? '' : 'none';
  }

  @ViewChild(TileSubmenuContainerComponent, { static: true })
  private _submenuContainer: TileSubmenuContainerComponent;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(public service: TileService) {}

  public ngOnInit() {
    if (this.toggle !== undefined) {
      this.toggle.subscribe((res) => {
        this.switchState();
      });
    } else {
      console.warn(`No toggle observable for tile navigation provided.`);
    }

    // Since HostBinding cannot res cannot resolve an observable, set up an
    // internal subscription to the service menu active state and set a private
    // member's value to the result.
    this.service.menuActive.pipe(takeUntil(this._$destroy)).subscribe((serviceState) => {
      this.menuVisible = serviceState;
    });
  }

  public ngAfterViewInit() {
    // A click even is registered on the TileComponent.
    //
    // On click, it submits it's referenced submenu template reference to the service,
    // which then emits. Here we consume the service submenu value to render
    // the submenu template reference.
    this.service.activeSubMenu
      .pipe(
        skip(1),
        takeUntil(this._$destroy)
      )
      .subscribe((res) => {
        this.service.toggleSubmenu();

        this._submenuContainer.container.clear();

        this._submenuContainer.container.createEmbeddedView(res.template);
      });
  }

  // Clean up any internal manual component subscriptions.
  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public switchState(state?: boolean) {
    this.service.toggleMenu();
  }
}
