import { TestBed } from '@angular/core/testing';

import { AdminTierService } from './admin-tier.service';

describe('AdminTierService', () => {
  let service: AdminTierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
