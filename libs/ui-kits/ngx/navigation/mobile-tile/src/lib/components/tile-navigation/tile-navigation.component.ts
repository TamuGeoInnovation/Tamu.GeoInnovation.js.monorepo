import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss'],
  providers: [TileService],
  animations: [
    trigger('menuShowHide', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale3d(0, 0, 0)',
          zIndex: -100
        }),
        animate(
          '.3s ease',
          style({
            opacity: 1,
            transform: 'none',
            zIndex: 10
          })
        )
      ]),
      transition(':leave', [
        style({
          opacity: '*',
          transform: '*',
          zIndex: '*'
        }),
        animate(
          '.4s ease',
          style({
            opacity: 0,
            transform: 'scale3d(0, 0, 0)',
            zIndex: -100
          })
        )
      ])
    ]),
    trigger('submenuShowHide', [
      transition(':enter', [
        style({
          transform: 'scale3d(0, 0, 0)',
          opacity: 0
        }),
        animate(
          '.3s ease',
          style({
            transform: 'scale3d(1, 1, 1)',
            opacity: 1
          })
        )
      ]),
      transition(':leave', [
        style({
          transform: '*',
          opacity: '*'
        }),
        animate(
          '.4s ease',
          style({
            transform: 'scale3d(0, 0, 0)',
            opacity: 0
          })
        )
      ])
    ]),
    trigger('tileAnimations', [
      transition(':enter', [
        query(
          '.tiles tamu-gisc-tile',
          [
            style({
              opacity: 0,
              transform: 'translate3d(0, 50px, 0)'
            }),
            stagger(-30, [
              animate(
                '.3s .35s ease',
                style({
                  opacity: 1,
                  transform: 'none'
                })
              )
            ])
          ],
          { optional: true }
        )
      ])
    ])
  ]
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
