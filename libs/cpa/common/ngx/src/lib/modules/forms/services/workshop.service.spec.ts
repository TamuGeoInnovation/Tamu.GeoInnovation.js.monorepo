import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { WorkshopService } from './workshop.service';

describe('WorkshopService', () => {
  let service: WorkshopService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        WorkshopService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(WorkshopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
