import { inject, TestBed } from '@angular/core/testing';

import { TestingService } from './application-testing.service';

describe('TestingService', () => {
  it('should be created', () => {
    inject([TestingService], (testingService: TestingService) => {
      expect(testingService).toBeTruthy();
    });
  });
});
