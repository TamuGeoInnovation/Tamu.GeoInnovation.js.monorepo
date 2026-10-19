import { Component } from '@angular/core';

import { PopupMobileComponent } from './mobile.component';

/**
 * The phone's popup container, loaded as soon as this renders instead of with the map (#1454).
 *
 * The container is hidden until a feature is chosen, and it brings interactjs, behind its drag handle,
 * which nothing else in a map's first download needs. Routes and templates name this component, not the
 * container: a route that loaded the container itself would hold the whole phone layout back until it
 * had downloaded.
 */
@Component({
  selector: 'tamu-gisc-feature-mobile-popup-deferred',
  template: '@defer (on immediate) {<tamu-gisc-feature-mobile-popup></tamu-gisc-feature-mobile-popup>}',
  styles: ':host { display: contents; }',
  imports: [PopupMobileComponent]
})
export class PopupMobileDeferredComponent {}
