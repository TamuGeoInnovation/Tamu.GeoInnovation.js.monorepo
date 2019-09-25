import { TestBed } from '@angular/core/testing';

import { FeatureSelectorService } from './selector.service';

describe('FeatureSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureSelectorService = TestBed.get(FeatureSelectorService);
    expect(service).toBeTruthy();
  });
});
