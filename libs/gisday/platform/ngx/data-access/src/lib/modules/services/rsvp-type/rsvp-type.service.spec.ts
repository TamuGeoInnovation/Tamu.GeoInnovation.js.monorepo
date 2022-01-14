import { TestBed } from '@angular/core/testing';

import { RsvpTypeService } from './rsvp-type.service';

describe('RsvpTypeService', () => {
  let service: RsvpTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RsvpTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
