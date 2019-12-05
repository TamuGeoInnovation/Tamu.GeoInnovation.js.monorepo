import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { FieldsService } from './fields.service';

describe('FieldsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: {
            api_url: 'http://'
          }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: FieldsService = TestBed.get(FieldsService);
    expect(service).toBeTruthy();
  });
});
