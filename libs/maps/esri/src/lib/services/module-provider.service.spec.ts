import { TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from './module-provider.service';

describe('EsriModuleProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EsriModuleProviderService = TestBed.get(EsriModuleProviderService);
    expect(service).toBeTruthy();
  });
});
