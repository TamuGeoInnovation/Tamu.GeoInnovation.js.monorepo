import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, timer, Observable, NEVER } from 'rxjs';
import { switchMap, takeUntil, shareReplay, distinctUntilChanged, take, filter } from 'rxjs/operators';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { TSRoute, BusService } from '@tamu-gisc/maps/feature/trip-planner';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-bus-route',
  templateUrl: './bus-route.component.html',
  styleUrls: ['./bus-route.component.scss']
})
export class BusRouteComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Provided TSRoute object from the parent component.
   */
  @Input()
  public route: TSRoute;

  @Input()
  public selection: 'route' | 'in-place' = 'in-place';

  @Input()
  public eagerLoad = false;

  @ViewChild(AccordionComponent, { static: false })
  public accordion;

  /**
   * Describes whether or not any given bus route is drawn on the map.
   */
  public isActive: boolean;

  public isLoading: boolean;

  private _graphics: Observable<boolean>;

  private _timer;

  /**
   * Emits once per bus route when the component is destroyed, ending all active and manual
   * observable subscriptions.
   */
  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private busService: BusService,
    private readonly router: Router,
    private readonly rt: ActivatedRoute,
    private readonly analytics: Angulartics2
  ) {}

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
              switchMap(() => {
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

  public ngAfterViewInit(): void {
    this.busService.busLayer
      .pipe(
        filter((l) => l !== null),
        take(1)
      )
      .subscribe(() => {
        if (this.eagerLoad) {
          this.toggleRoute();

          this.accordion.toggle();
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
   */
  public toggleRoute(): void {
    this.reportToggleRoute(this.route.ShortName);

    if (this.selection === 'route') {
      this.router.navigate([this.route.ShortName], { relativeTo: this.rt });
    }

    if (!this.isLoading) {
      this.isLoading = true;
    }

    if (this.selection === 'in-place') {
      this.busService.toggleMapRoute(this.route.ShortName);
    }
  }

  private reportToggleRoute(shortName: string) {
    const label = {
      guid: guid(),
      date: Date.now(),
      name: shortName
    };

    this.analytics.eventTrack.next({
      action: 'bus_route_load',
      properties: {
        category: 'ui_interaction',
        gstCustom: label
      }
    });
  }
}
