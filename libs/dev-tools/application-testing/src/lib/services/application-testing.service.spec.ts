import { waitForAsync, inject, TestBed } from '@angular/core/testing';

import { ACTING_AS_PRODUCTION, TestingService } from './application-testing.service';

describe('TestingService', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({ providers: [TestingService] }).compileComponents();
  }));

  it('should be created', inject([TestingService], (testingService: TestingService) => {
    expect(testingService).toBeTruthy();
  }));

  it('should have the correct testing value', inject([TestingService], (testingService: TestingService) => {
    expect(testingService.get('isTesting')).toBeTruthy();
  }));

  // Jest's page is served from `localhost`, which is a development host.
  it('reports a development host as testing, and not as acting as production', inject(
    [TestingService],
    (testingService: TestingService) => {
      expect(testingService.isTesting).toBe(true);
      expect(testingService.actingAsProduction).toBe(false);
    }
  ));
});

describe('TestingService, asked to behave as production (#1722)', () => {
  it('turns development features off on a development host, and says it did', () => {
    TestBed.configureTestingModule({ providers: [TestingService, { provide: ACTING_AS_PRODUCTION, useValue: true }] });

    const testingService = TestBed.inject(TestingService);

    expect(testingService.isTesting).toBe(false);
    expect(testingService.actingAsProduction).toBe(true);
  });
});
