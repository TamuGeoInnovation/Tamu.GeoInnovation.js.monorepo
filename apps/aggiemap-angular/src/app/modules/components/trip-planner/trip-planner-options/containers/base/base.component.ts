import { Component, ChangeDetectionStrategy, ComponentFactoryResolver, ViewChild, OnInit } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap, filter, toArray, take, shareReplay, find, pluck } from 'rxjs/operators';

import { RenderHostDirective } from '@tamu-gisc/ui-kits/ngx/layout/structural';
import { TripPlannerOptionsComponentService } from '../../services/trip-planner-options-component.service';

import {
  TripPlannerService,
  TripPlannerRuleMode,
  TravelOptions,
  TripPlannerRule
} from '../../../../../services/trip-planner/trip-planner.service';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerOptionsBaseComponent } from '../../components/base/base.component';
import { TripPlannerParkingOptionsComponent } from '../../components/parking/trip-planner-parking-options.component';
import { TripPlannerBikingOptionsComponent } from '../../components/biking/trip-planner-biking-options.component';

@Component({
  selector: 'gisc-trip-planner-options',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripPlannerOptionsComponent implements OnInit {
  public readonly isDev = this.testingService.get('isTesting').pipe(shareReplay(1)) as Observable<boolean>;

  public readonly travelOptions: Observable<TravelOptions> = this.plannerService.TravelOptions;

  public readonly currentRuleAccessibility: Observable<boolean> = of(this.plannerService.verifyRuleAccessibility());

  /**
   * Available mode options for the currently selected travel mode.
   *
   * @type {Observable<TripPlannerRule>}
   * @memberof TripPlannerOptionsComponent
   */
  public readonly Options: Observable<TripPlannerRuleMode[]> = this.travelOptions.pipe(
    pluck('travel_mode'),
    switchMap((mode) => {
      return this.plannerService.Rules.pipe(
        switchMap((rules) => {
          // Nest this observable because we need access to the parent `mode`
          return from(rules).pipe(
            switchMap((rule) => {
              return of(this.plannerService.flattenRule(rule));
            }),
            find((modes: TripPlannerRuleMode[]) => {
              // Return the first rule that contains the current mode as one of its options.
              return modes.some((opt) => {
                return opt.mode === mode;
              });
            })
          );
        })
      );
    })
  );

  public readonly ModeOptions: Observable<TripPlannerRuleMode[]> = this.Options.pipe(
    // Because `Options` is a long-lived observable, without taking the first emission it
    // it will never complete and the subscription will will never trigger.
    take(1),
    switchMap((modes) => {
      return from(modes);
    }),
    filter((mode) => {
      return mode.visible;
    }),
    toArray(),
    shareReplay(1) // Share result will multiple template and late subscribers.
  );

  /**
   * Reference to the component content host. Travel option child components will be rendered within,.
   *
   * @type {PopupContentHostDirective}
   * @memberof PopupComponent
   */
  @ViewChild(RenderHostDirective, { static: true }) public viewHost: RenderHostDirective;

  constructor(
    private plannerService: TripPlannerService,
    private testingService: TestingService,
    private componentService: TripPlannerOptionsComponentService,
    private componentResolver: ComponentFactoryResolver
  ) {}

  public ngOnInit(): void {
    this.render();
  }

  public updateOption(option, value): void {
    // Create options object to be passed into planner service.
    const opt = Array(1)
      .fill(null)
      .reduce((acc, curr, index) => {
        acc[option] = value;

        return acc;
      }, {});

    this.plannerService.updateTravelOptions(opt);
  }

  public getOptionvalue<T>(option: string): Observable<T> {
    return this.travelOptions.pipe(pluck(option));
  }

  /**
   * Renders an travel options component, if one exists, for the current travel mode.
   *
   * @memberof PopupComponent
   */
  public render() {
    const component = this.componentService.getComponent();

    if (!component) {
      return;
    }

    // Resolve component
    const factory = this.componentResolver.resolveComponentFactory<
      TripPlannerParkingOptionsComponent | TripPlannerBikingOptionsComponent
    >(component);

    // Get reference to the view container (host)
    const container = this.viewHost.viewContainerRef;

    // Clear the view container (host)
    container.clear();

    // Create component from resolved component from component factory
    const resolvedComponent = container.createComponent(factory);

    // Pass in feature data to the created component
    // Will only handle a single feature for now.
    resolvedComponent.instance.settings = this.ModeOptions;
  }
}
