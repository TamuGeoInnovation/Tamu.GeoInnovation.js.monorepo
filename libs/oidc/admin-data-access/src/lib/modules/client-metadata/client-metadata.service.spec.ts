import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ClientMetadataService } from './client-metadata.service';

describe('ClientMetadataService', () => {
  let service: ClientMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        ClientMetadataService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(ClientMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
