import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { EsriMapService, HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { RenderHostDirective } from '@tamu-gisc/ui-kits/ngx/layout';

import { PopupService } from '../../services/popup.service';
import { BasePopupComponent } from '../../components/base/base.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-feature-popup',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  /**
   * Holds graphic items from the mapService hitTest observable.
   */
  public snapshot: HitTestSnapshot;

  /**
   * Property that determines when the popup container will render
   *
   * True will render.
   *
   * False will de-render.
   */
  public show: Observable<boolean>;

  /**
   * Subscription to the mapServices' hitTest observable.
   *
   * Is referenced to unsubscribe on component destroy.
   */
  private _hitTestSubscription: Subscription;

  /**
   * Reference to the component content host. Popup child components will be rendered within,.
   */
  @ViewChild(RenderHostDirective, { static: true }) public viewHost: RenderHostDirective;

  /**
   * Allows closing the popup with the keyboard `esc` key.
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
    this.show = this.popupService.show;

    this._hitTestSubscription = this.mapService.hitTest
      .pipe(withLatestFrom(this.popupService.suppressed))
      .subscribe(([snapshot, popupsSuppressed]) => {
        this.snapshot = snapshot;

        if (popupsSuppressed !== true && snapshot.graphics.length > 0 && snapshot.graphics.every((g) => g != null)) {
          this.render();
        } else {
          this.popupService.hidePopup();
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
   */
  public render() {
    if (this.snapshot && this.snapshot.graphics && this.snapshot.graphics.length > 0) {
      const resolved = this.popupService.getComponent({ ...this.snapshot });

      if (resolved === undefined) {
        console.warn(`Popup component could not be resolved.`);
        this.popupService.hidePopup();
        return;
      }

      this.popupService.showPopup();

      // Resolve component
      const factory = this.componentResolver.resolveComponentFactory(resolved.component);

      // Get reference to the view container (host)
      const container = this.viewHost.viewContainerRef;

      // Clear the view container (host)
      container.clear();

      // Create component from resolved component from component factory
      const resolvedComponent = container.createComponent(factory) as ComponentRef<BasePopupComponent>;

      // Pass in feature data to the created component
      // Will only handle a single feature for now.
      resolvedComponent.instance.data = resolved.data ? resolved.data : this.snapshot.graphics[0];
    }
  }

  /**
   * Calls map service to clear hit test data, which removes the popup.
   */
  public close() {
    this.mapService.clearHitTest();
    this.mapService.clearSelectedFeatures();
  }
}
