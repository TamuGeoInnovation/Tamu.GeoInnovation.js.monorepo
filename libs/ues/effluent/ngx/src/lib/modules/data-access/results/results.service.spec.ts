import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ResultsService } from './results.service';

describe('ResultsService', () => {
  let service: ResultsService;
  /* */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        ResultsService,
        {
          provide: env,
          useValue: { apiUrl: {} }
        }
      ]
    });
    service = TestBed.inject(ResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
