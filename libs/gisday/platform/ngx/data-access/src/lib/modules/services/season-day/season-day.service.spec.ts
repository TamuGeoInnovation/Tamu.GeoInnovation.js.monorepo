import { TestBed } from '@angular/core/testing';

import { SeasonDayService } from './season-day.service';

describe('SeasonDayService', () => {
  let service: SeasonDayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeasonDayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
