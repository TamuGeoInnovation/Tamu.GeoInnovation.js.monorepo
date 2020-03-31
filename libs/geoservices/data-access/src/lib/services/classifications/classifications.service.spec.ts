import { TestBed } from '@angular/core/testing';

import { ClassificationsService } from './classifications.service';

describe('ClassificationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClassificationsService = TestBed.get(ClassificationsService);
    expect(service).toBeTruthy();
  });
});
