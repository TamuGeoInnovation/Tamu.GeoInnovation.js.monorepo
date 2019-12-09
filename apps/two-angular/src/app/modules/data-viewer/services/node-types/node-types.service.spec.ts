import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { NodeTypesService } from './node-types.service';

describe('NodeTypesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'http://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: NodeTypesService = TestBed.get(NodeTypesService);
    expect(service).toBeTruthy();
  });
});
