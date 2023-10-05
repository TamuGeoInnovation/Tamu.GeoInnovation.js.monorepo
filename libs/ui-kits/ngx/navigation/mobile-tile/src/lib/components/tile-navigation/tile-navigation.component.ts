import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';
import { baseShowHideAnimation, submenuShowHideAnimation, tileStaggerAnimation } from '../../animations/animations';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService],
  animations: [baseShowHideAnimation, submenuShowHideAnimation, tileStaggerAnimation]
})
export class TileNavigationComponent implements OnInit, OnDestroy {
  @Input()
  public toggle: Observable<boolean>;

  /**
   * While the main control mechanism for the tile nav component is the input
   * `toggle` observable, that only provides values as a result of a client
   * interacting with the toggle. This component needs to be able to communicate
   * back to the toggle to reflect the change in the view.
   *
   * This event is emitted when the tile navigation component has gone from
   * visible state `true` to `false`
   */
  @Output()
  public closed: EventEmitter<boolean> = new EventEmitter();

  /**
   * While the main control mechanism for the tile nav component is the input
   * `toggle` observable, that only provides values as a result of a client
   * interacting with the toggle. This component needs to be able to communicate
   * back to the toggle to reflect the change in the view.
   *
   * This event is emitted when the tile navigation component has gone from
   * visible state `false` to `true`
   */
  @Output()
  public opened: EventEmitter<boolean> = new EventEmitter();

  /**
   * Determines the visibility of the tile nav based on the emissions
   * from the provided `toggle` observable.
   */
  public visible = this.service.menuActive.pipe(distinctUntilChanged());

  private _$destroy: Subject<boolean> = new Subject();

  constructor(public service: TileService) {}

  public ngOnInit() {
    if (this.toggle !== undefined) {
      this.toggle.pipe(takeUntil(this._$destroy)).subscribe((v) => {
        this.switchState(v);
      });

      // The first emission out of `visible` will be the default state.
      // Only care to dispatch open and close events starting on the second
      // emission.
      this.visible.pipe(skip(1), takeUntil(this._$destroy)).subscribe((state) => {
        if (state === true) {
          this.opened.next(true);
        } else {
          this.closed.next(true);
        }
      });
    } else {
      console.warn(`No toggle observable for tile navigation provided.`);
    }
  }

  // Clean up any internal manual component subscriptions.
  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public switchState(state) {
    this.service.toggleMenu(state);
  }
}
