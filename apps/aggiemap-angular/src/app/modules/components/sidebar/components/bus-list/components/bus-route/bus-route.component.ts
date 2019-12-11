import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TSRoute, BusService } from '../../../../../../services/transportation/bus/bus.service';
import { switchMap, takeUntil, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { of, Subject, timer, Observable, NEVER } from 'rxjs';

@Component({
  selector: 'gisc-bus-route',
  templateUrl: './bus-route.component.html',
  styleUrls: ['./bus-route.component.scss']
})
export class BusRouteComponent implements OnInit, OnDestroy {
  /**
   * Provided TSRoute object from the parent component.
   *
   * @type {TSRoute}
   * @memberof BusRouteComponent
   */
  @Input()
  public route: TSRoute;

  /**
   * Describes whether or not any given bus route is drawn on the map.
   *
   * @type {boolean}
   * @memberof BusRouteComponent
   */
  public isActive: boolean;

  public isLoading: boolean;

  private _graphics: Observable<boolean>;

  private _timer;

  /**
   * Emits once per bus route when the component is destroyed, ending all active and manual
   * observable subscriptions.
   *
   * @private
   * @type {Subject<boolean>}
   * @memberof BusRouteComponent
   */
  private _destroy$: Subject<boolean> = new Subject();

  constructor(private busService: BusService) {}

  public ngOnInit() {
    // Each route makes a subscription to this function that returns a boolean
    // function value describing whether their bound route, waypoints, or buses
    // are drawn on the map at any given time. This results in a true reflection
    // on what features are active on the map.
    this._graphics = this.busService.busLayerGraphics.pipe(
      takeUntil(this._destroy$),
      switchMap((graphics) => {
        const anyGraphicsForProvidedRoute = graphics.some((graphic) => {
          return graphic.attributes.id === this.route.ShortName;
        });

        return of(anyGraphicsForProvidedRoute);
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );

    this._graphics.subscribe((res: boolean) => {
      // Will be true or false depending on whether the bus layer contains
      // any graphics with the route shortname.
      this.isActive = res;

      if (!this.isActive) {
        this.isLoading = false;

        if (this._timer) {
          this._timer.unsubscribe();
          this._timer = undefined;
          this.busService.toggleBusLocations(this.route.ShortName, 'remove');
        }
      }

      if (this.isActive) {
        // Begin timer that runs when the route is drawn on the map.
        // After each specified time interval, it updates the bus locations on map.
        if (!this._timer) {
          this._timer = timer(0, 15000)
            .pipe(
              takeUntil(this._destroy$),
              switchMap((v) => {
                return this.isActive ? of(true) : NEVER;
              })
            )
            .subscribe(() => {
              this.busService.toggleBusLocations(this.route.ShortName, 'update');
            });
        }
      }
    });
  }

  public ngOnDestroy() {
    this._destroy$.next(true);
    this._destroy$.complete();

    // Remove any active bus locations on the map.
    if (this.isActive) {
      this.busService.toggleBusLocations(this.route.ShortName, 'remove');
    }
  }

  /**
   * Either removes or adds the bound route features to/from the map.
   *
   * @memberof BusRouteComponent
   */
  public toggleRoute(): void {
    if (!this.isLoading) {
      this.isLoading = true;
    }

    this.busService.toggleMapRoute(this.route.ShortName);
  }
}
