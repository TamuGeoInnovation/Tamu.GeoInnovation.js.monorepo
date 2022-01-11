import { TestBed } from '@angular/core/testing';

import { ClientMetadataService } from './client-metadata.service';

describe('ClientMetadataService', () => {
  let service: ClientMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
