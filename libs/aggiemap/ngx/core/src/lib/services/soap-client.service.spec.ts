import { TestBed } from '@angular/core/testing';

import { SoapClientService } from './soap-client.service';

describe('SoapClientService', () => {
  let service: SoapClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoapClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
