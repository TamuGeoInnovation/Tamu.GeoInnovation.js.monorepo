import { inject, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from './module-provider.service';

describe('EsriModuleProviderService', () => {
  it('should be created', () => {
    inject([EsriModuleProviderService], (esriModuleProviderService: EsriModuleProviderService) => {
      expect(esriModuleProviderService).toBeTruthy();
    });
  });
});
