import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';

import { RenderHostDirective } from '../../../../directives/render-host.directive';

import { PopupService } from '../../services/popup.service';
import { EsriMapService, HitTestSnapshot } from '@tamu-gisc/maps/esri';
import esri = __esri;
import { BasePopupComponent } from '../../components/base/base.popup.component';

@Component({
  selector: 'feature-popup',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [PopupService]
})
export class PopupComponent implements OnInit, OnDestroy {
  /**
   * Holds graphic items from the mapService hitTest observable.
   *
   * @type {esri.Graphic[]}
   * @memberof PopupComponent
   */
  public snapshot: HitTestSnapshot;

  /**
   * Property that determines when the popup container will render
   *
   * True will render.
   *
   * False will de-render.
   *
   * @type {boolean}
   * @memberof PopupComponent
   */
  public show: boolean;

  /**
   * Subscription to the mapServices' hitTest observable.
   *
   * Is referenced to unsubscribe on component destroy.
   *
   * @private
   * @type {Subscription}
   * @memberof PopupComponent
   */
  private _hitTestSubscription: Subscription;

  /**
   * Reference to the component content host. Popup child components will be rendered within,.
   *
   * @type {PopupContentHostDirective}
   * @memberof PopupComponent
   */
  @ViewChild(RenderHostDirective, { static: true }) public viewHost: RenderHostDirective;

  /**
   * Allows closing the popup with the keyboard `esc` key.
   *
   * @param {KeyboardEvent} event
   * @memberof PopupComponent
   */
  @HostListener('window:keyup.esc', ['$event'])
  public escapeKeydown(event: KeyboardEvent) {
    this.close();
  }

  constructor(
    private mapService: EsriMapService,
    private popupService: PopupService,
    private componentResolver: ComponentFactoryResolver
  ) {}

  public ngOnInit() {
    this._hitTestSubscription = this.mapService.hitTest.subscribe((snapshot) => {
      this.snapshot = snapshot;
      if (snapshot.graphics.length > 0 && snapshot.graphics.every((g) => g != null)) {
        this.show = true;
        this.render();
      } else {
        this.show = false;
      }
    });
  }

  public ngOnDestroy() {
    this._hitTestSubscription.unsubscribe();
  }

  /**
   * Renders a popup component based on layer in place of using the popupTemplate property in a layer.
   *
   * This allows more dynamic templating and Angular-specific data service access and other interaction
   * driven events using the framework itself, as opposed to botching together a bunch of
   * document.querySelector() and manual event handlers.
   *
   * @memberof PopupComponent
   */
  public render() {
    if (this.snapshot && this.snapshot.graphics && this.snapshot.graphics.length > 0) {
      const component = this.popupService.getComponent({ ...this.snapshot });

      if (!component) {
        console.warn(`Popup component could not be resolved.`);
        this.show = false;
        return;
      }

      // Resolve component
      const factory = this.componentResolver.resolveComponentFactory(component);

      // Get reference to the view container (host)
      const container = this.viewHost.viewContainerRef;

      // Clear the view container (host)
      container.clear();

      // Create component from resolved component from component factory
      const resolvedComponent = container.createComponent(factory) as ComponentRef<BasePopupComponent>;

      // Pass in feature data to the created component
      // Will only handle a single feature for now.
      resolvedComponent.instance.data = this.snapshot.graphics[0];
    }
  }

  /**
   * Calls map service to clear hit test data, which removes the popup.
   *
   * @memberof PopupComponent
   */
  public close() {
    this.mapService.clearHitTest();
    this.mapService.clearSelectedFeatures();
  }
}
