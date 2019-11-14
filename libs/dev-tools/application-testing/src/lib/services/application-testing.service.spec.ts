import { async, inject, TestBed } from '@angular/core/testing';

import { TestingService } from './application-testing.service';

describe('TestingService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [TestingService] }).compileComponents();
  }));

  it('should be created', inject([TestingService], (testingService: TestingService) => {
    expect(testingService).toBeTruthy();
  }));

  it('should have the correct testing value', inject([TestingService], (testingService: TestingService) => {
    expect(testingService.get('isTesting')).toBeTruthy();
  }));
});
