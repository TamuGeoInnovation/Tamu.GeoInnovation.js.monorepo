import { TestBed } from '@angular/core/testing';

import { UserClassesService } from './user-classes.service';

describe('UserClassesService', () => {
  let service: UserClassesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserClassesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
