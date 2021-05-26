import { TestBed } from '@angular/core/testing';

import { UserSubmissionsService } from './user-submissions.service';

describe('UserSubmissionsService', () => {
  let service: UserSubmissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSubmissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
