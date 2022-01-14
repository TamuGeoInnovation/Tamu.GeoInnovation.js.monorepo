import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SnapshotService } from './snapshot.service';

describe('SnapshotService', () => {
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
    const service: SnapshotService = TestBed.get(SnapshotService);
    expect(service).toBeTruthy();
  });
});
