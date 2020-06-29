import { TestBed } from '@angular/core/testing';

import { WorkshopService } from './workshop.service';

describe('WorkshopService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkshopService = TestBed.get(WorkshopService);
    expect(service).toBeTruthy();
  });
});
