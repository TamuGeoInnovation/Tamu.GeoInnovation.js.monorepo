import { TestBed } from '@angular/core/testing';

import { FieldsService } from './fields.service';

describe('FieldsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FieldsService = TestBed.get(FieldsService);
    expect(service).toBeTruthy();
  });
});
