import { TestBed } from '@angular/core/testing';

import { PhoneNumbersService } from './phone-numbers.service';

describe('PhoneNumbersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PhoneNumbersService = TestBed.get(PhoneNumbersService);
    expect(service).toBeTruthy();
  });
});
