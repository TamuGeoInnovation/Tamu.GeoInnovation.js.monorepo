import {
  Component,
  ComponentRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  viewChild
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { EsriMapService, HitTestSnapshot, loadPopupComponent } from '@tamu-gisc/maps/esri';
import { RenderHostDirective } from '@tamu-gisc/ui-kits/ngx/layout';

import { PopupService } from '../../services/popup.service';
import { BasePopupComponent } from '../../components/base/base.component';
import { NgClass, AsyncPipe } from '@angular/common';

import { RenderHostDirective as RenderHostDirective_1 } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-feature-popup',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [NgClass, RenderHostDirective_1, AsyncPipe]
})
export class PopupComponent implements OnInit, OnDestroy {
  private mapService = inject(EsriMapService);
  private popupService = inject(PopupService);

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
   * Counts render requests, so a popup whose component finishes loading after a newer one was asked
   * for is dropped instead of replacing it.
   */
  private _renderRequest = 0;

  /**
   * Reference to the component content host. Popup child components will be rendered within,.
   */
  public readonly viewHost = viewChild(RenderHostDirective);

  /**
   * Allows closing the popup with the keyboard `esc` key.
   */
  @HostListener('window:keyup.esc')
  public escapeKeydown() {
    this.close();
  }

  public ngOnInit() {
    this.show = this.popupService.show;

    this._hitTestSubscription = this.mapService.hitTest
      .pipe(withLatestFrom(this.popupService.suppressed))
      .subscribe(([snapshot, popupsSuppressed]) => {
        this.snapshot = snapshot;

        if (popupsSuppressed !== true && snapshot.graphics.length > 0 && snapshot.graphics.every((g) => g != null)) {
          this.render();
        } else {
          this._renderRequest++;
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

      const request = ++this._renderRequest;
      const data = resolved.data ? resolved.data : this.snapshot.graphics[0];

      // Ask for the panel now, not when the component arrives (#1684). The sidebar shows its own
      // default view whenever nothing is asking for the popup panel, so waiting for the download
      // left it falling back for about 100 ms between one feature's popup and the next. A dynamic
      // import never resolves in the same tick, so that gap was there even with the chunk cached.
      // Closing the popup while a component is still loading still hides it: the hit test with no
      // graphics calls `hidePopup` after this, and the stale load is dropped below.
      this.popupService.showPopup();

      // A popup component is downloaded the first time one of its kind is opened (#1454).
      loadPopupComponent(resolved.component)
        .then((component) => {
          if (request !== this._renderRequest) {
            return;
          }

          // Get reference to the view container (host)
          const container = this.viewHost().viewContainerRef;

          // Clear the view container (host)
          container.clear();

          // Create the resolved component in the host
          const resolvedComponent = container.createComponent(component) as ComponentRef<BasePopupComponent>;

          // Pass in feature data to the created component
          // Will only handle a single feature for now.
          resolvedComponent.instance.data = data;

          // `data` is a field, not an input, so nothing tells this OnPush popup or the component in it
          // that there is something new to draw (#1673).
          resolvedComponent.changeDetectorRef.markForCheck();
        })
        .catch((error) => {
          console.warn('Popup component could not be loaded.', error);

          if (request === this._renderRequest) {
            this.popupService.hidePopup();
          }
        });
    } else {
      // Nothing to show: a component still loading for an earlier request must not appear.
      this._renderRequest++;
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
