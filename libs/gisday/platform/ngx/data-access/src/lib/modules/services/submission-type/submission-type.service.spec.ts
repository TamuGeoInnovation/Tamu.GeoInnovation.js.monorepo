import { TestBed } from '@angular/core/testing';

import { SubmissionTypeService } from './submission-type.service';

describe('SubmissionTypeService', () => {
  let service: SubmissionTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmissionTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
