import { TestBed } from '@angular/core/testing';

import { CategoryLocationMenuService } from './category-location-menu.service';

describe('CategoryLocationMenuService', () => {
  let service: CategoryLocationMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryLocationMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
