import { inject, TestBed } from '@angular/core/testing';

import { EsriMapService } from './map.service';

describe('EsriMapService', () => {
  it('should be created', () => {
    inject([EsriMapService], (esriMapService: EsriMapService) => {
      expect(esriMapService).toBeTruthy();
    });
  });
});
