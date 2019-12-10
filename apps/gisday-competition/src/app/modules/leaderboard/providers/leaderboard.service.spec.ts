import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { LeaderboardUrl: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: LeaderboardService = TestBed.get(LeaderboardService);

    expect(service).toBeTruthy();
  });
});
