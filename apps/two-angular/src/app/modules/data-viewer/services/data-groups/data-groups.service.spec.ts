import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { DataGroupsService } from './data-groups.service';

describe('DataGroupsService', () => {
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
    const service: DataGroupsService = TestBed.get(DataGroupsService);
    expect(service).toBeTruthy();
  });
});
