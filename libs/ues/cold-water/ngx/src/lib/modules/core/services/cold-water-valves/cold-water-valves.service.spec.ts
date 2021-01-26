import { TestBed } from '@angular/core/testing';

import { ColdWaterValvesService } from './cold-water-valves.service';

describe('ValvesService', () => {
  let service: ColdWaterValvesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColdWaterValvesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
