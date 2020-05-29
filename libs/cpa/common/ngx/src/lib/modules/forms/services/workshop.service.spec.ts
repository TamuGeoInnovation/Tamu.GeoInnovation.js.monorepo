import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { WorkshopService } from './workshop.service';

describe('WorkshopService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: WorkshopService = TestBed.get(WorkshopService);
    expect(service).toBeTruthy();
  });
});
