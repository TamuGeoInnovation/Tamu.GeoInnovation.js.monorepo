import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SubmissionService } from './submission.service';

describe('SubmissionService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { SubmissionsPostUrl: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: SubmissionService = TestBed.get(SubmissionService);
    expect(service).toBeTruthy();
  });
});
