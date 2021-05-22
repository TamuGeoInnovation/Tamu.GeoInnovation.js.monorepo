import { async, inject, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from './module-provider.service';

describe('EsriModuleProviderService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [EsriModuleProviderService] }).compileComponents();
  }));

  it('should be created', inject([EsriModuleProviderService], (esriModuleProviderService: EsriModuleProviderService) => {
    expect(esriModuleProviderService).toBeTruthy();
  }));
});
