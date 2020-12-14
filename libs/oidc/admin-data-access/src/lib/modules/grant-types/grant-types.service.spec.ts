import { TestBed } from '@angular/core/testing';

import { GrantTypesService } from './grant-types.service';

describe('GrantTypesService', () => {
  let service: GrantTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrantTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
