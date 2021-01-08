import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { FeatureHighlightService } from './feature-highlight.service';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('FeatureHighlightService', () => {
  let service: FeatureHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ]
    });
    service = TestBed.inject(FeatureHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
