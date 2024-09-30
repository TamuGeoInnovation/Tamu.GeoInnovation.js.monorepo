import { TestBed } from '@angular/core/testing';

import { MoveInOutSettingsService } from './move-in-out-settings.service';

describe('MoveInOutSettingsService', () => {
  let service: MoveInOutSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoveInOutSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
