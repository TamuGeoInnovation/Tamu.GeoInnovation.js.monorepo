import { TestBed } from '@angular/core/testing';

import { RecyclingService } from './recycling.service';

describe('RecyclingService', () => {
  let service: RecyclingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecyclingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
