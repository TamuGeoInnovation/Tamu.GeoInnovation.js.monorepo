import { TestBed } from '@angular/core/testing';

import { AdminTierFormService } from './admin-tier-form.service';

describe('AdminTierFormService', () => {
  let service: AdminTierFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTierFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
