import { inject } from '@angular/core/testing';

import { EsriMapComponent } from './esri-map.component';

describe('EsriMapComponent', () => {
  it('should create', () => {
    inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
      expect(esriMapComponent).toBeTruthy();
    });
  });
});
