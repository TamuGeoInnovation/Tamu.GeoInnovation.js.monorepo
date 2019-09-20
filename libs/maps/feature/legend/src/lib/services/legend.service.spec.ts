import { TestBed } from '@angular/core/testing';

import { LegendService } from './legend.service';

describe('LegendService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LegendService = TestBed.get(LegendService);
    expect(service).toBeTruthy();
  });
});
