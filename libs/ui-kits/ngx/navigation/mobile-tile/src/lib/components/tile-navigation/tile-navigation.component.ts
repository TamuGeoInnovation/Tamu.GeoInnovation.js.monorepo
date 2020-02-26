import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';
import { baseShowHideAnimation, submenuShowHideAnimation } from '../../animations/animations';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService],
  animations: [baseShowHideAnimation, submenuShowHideAnimation]
})
export class TileNavigationComponent implements OnInit, OnDestroy {
  @Input()
  public toggle: Observable<boolean>;

  public menuVisible = false;

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

  // Clean up any internal manual component subscriptions.
  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public switchState(state?: boolean) {
    this.service.toggleMenu();
  }
}
