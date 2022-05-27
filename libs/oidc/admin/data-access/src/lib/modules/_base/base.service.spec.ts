import { TestBed } from '@angular/core/testing';

import { BaseService } from './base.service';

describe('BaseService', <T>() => {
  let service: BaseService<T>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
