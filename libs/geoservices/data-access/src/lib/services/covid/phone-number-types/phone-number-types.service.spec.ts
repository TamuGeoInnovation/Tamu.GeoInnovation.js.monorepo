import { TestBed } from '@angular/core/testing';

import { PhoneNumberTypesService } from './phone-number-types.service';

describe('PhoneNumberTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PhoneNumberTypesService = TestBed.get(PhoneNumberTypesService);
    expect(service).toBeTruthy();
  });
});
