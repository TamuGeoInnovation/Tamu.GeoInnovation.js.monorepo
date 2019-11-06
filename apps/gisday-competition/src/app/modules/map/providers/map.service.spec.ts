import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { CompetitionService } from './map.service';


describe('MapService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: CompetitionService = TestBed.get(CompetitionService);
    expect(service).toBeTruthy();
  });
});
