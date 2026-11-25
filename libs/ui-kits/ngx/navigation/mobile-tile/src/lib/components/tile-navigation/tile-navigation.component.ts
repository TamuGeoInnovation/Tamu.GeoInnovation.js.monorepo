import { Component, OnInit, OnDestroy, inject, output, input, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';
import { TileSubmenuContainerComponent } from '../tile-submenu-container/tile-submenu-container.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService],
  imports: [TileSubmenuContainerComponent, AsyncPipe]
})
export class TileNavigationComponent implements OnInit, OnDestroy {
  service = inject(TileService);

  public readonly toggle = input<Observable<boolean>>(undefined);

  /**
   * While the main control mechanism for the tile nav component is the input
   * `toggle` observable, that only provides values as a result of a client
   * interacting with the toggle. This component needs to be able to communicate
   * back to the toggle to reflect the change in the view.
   *
   * This event is emitted when the tile navigation component has gone from
   * visible state `true` to `false`
   */
  public readonly closed = output<boolean>();

  /**
   * While the main control mechanism for the tile nav component is the input
   * `toggle` observable, that only provides values as a result of a client
   * interacting with the toggle. This component needs to be able to communicate
   * back to the toggle to reflect the change in the view.
   *
   * This event is emitted when the tile navigation component has gone from
   * visible state `false` to `true`
   */
  public readonly opened = output<boolean>();

  /**
   * Determines the visibility of the tile nav based on the emissions
   * from the provided `toggle` observable.
   */
  public visible = this.service.menuActive.pipe(distinctUntilChanged());

  /**
   * True while the menu opens, when its tiles rise in one after another (libs/sass/motion's tile-stagger), and false
   * once the last of them is in place, so tiles shown again on leaving a submenu do not stagger (#2278).
   */
  public readonly staggering = signal(false);

  private _$destroy: Subject<boolean> = new Subject();

  public ngOnInit() {
    this.visible.pipe(takeUntil(this._$destroy)).subscribe((visible) => {
      if (visible) {
        this.staggering.set(true);
      }
    });

    const toggle = this.toggle();
    if (toggle !== undefined) {
      toggle.pipe(takeUntil(this._$destroy)).subscribe((v) => {
        this.switchState(v);
      });

      // The first emission out of `visible` will be the default state.
      // Only care to dispatch open and close events starting on the second
      // emission.
      this.visible.pipe(skip(1), takeUntil(this._$destroy)).subscribe((state) => {
        if (state === true) {
          this.opened.emit(true);
        } else {
          this.closed.emit(true);
        }
      });
    } else {
      console.warn(`No toggle observable for tile navigation provided.`);
    }
  }

  /**
   * The stagger runs from the last tile to the first, so the first tile's arrival ends it.
   */
  public tileEntered(event: AnimationEvent) {
    if (event.animationName.includes('tile-stagger-in') && (event.target as Element).matches('tamu-gisc-tile:first-child')) {
      this.staggering.set(false);
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
