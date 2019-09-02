import { TestBed } from '@angular/core/testing';

import { ModuleProviderService } from './module-provider.service';

describe('ModuleProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModuleProviderService = TestBed.get(ModuleProviderService);
    expect(service).toBeTruthy();
  });
});
