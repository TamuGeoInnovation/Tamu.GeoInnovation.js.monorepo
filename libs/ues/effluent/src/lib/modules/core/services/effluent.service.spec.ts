import { TestBed } from '@angular/core/testing';

import { EffluentService } from './effluent.service';

describe('EffluentService', () => {
  let service: EffluentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(EffluentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
