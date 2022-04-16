import { TestBed } from '@angular/core/testing';

import { ModalRefService } from './modal-ref.service';

describe('ModalRefService', () => {
  let service: ModalRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalRefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
