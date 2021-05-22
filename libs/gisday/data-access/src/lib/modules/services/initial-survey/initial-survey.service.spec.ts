import { TestBed } from '@angular/core/testing';

import { InitialSurveyService } from './initial-survey.service';

describe('InitialSurveyService', () => {
  let service: InitialSurveyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialSurveyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
