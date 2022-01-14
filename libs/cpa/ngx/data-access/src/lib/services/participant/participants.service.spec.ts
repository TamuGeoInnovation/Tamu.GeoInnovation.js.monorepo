import { TestBed } from '@angular/core/testing';

import { ParticipantService } from './participants.service';

describe('ParticipantService', () => {
  let service: ParticipantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
