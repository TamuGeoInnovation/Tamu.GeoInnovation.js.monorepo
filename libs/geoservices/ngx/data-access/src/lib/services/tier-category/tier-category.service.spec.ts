import { TestBed } from '@angular/core/testing';

import { TierCategoryService } from './tier-category.service';

describe('TierCategoryService', () => {
  let service: TierCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TierCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
