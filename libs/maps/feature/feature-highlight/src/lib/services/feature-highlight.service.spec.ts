import { TestBed } from '@angular/core/testing';

import { FeatureHighlightService } from './feature-highlight.service';

describe('FeatureHighlightService', () => {
  let service: FeatureHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
