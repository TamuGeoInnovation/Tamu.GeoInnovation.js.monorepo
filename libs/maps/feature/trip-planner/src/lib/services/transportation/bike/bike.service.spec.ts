import { async, inject, TestBed } from '@angular/core/testing';

import { BikeService } from './bike.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('BikeService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        BikeService,
        SearchService,
        {
          provide: env,
          useValue: {
            SearchSources: []
          }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([BikeService], (component: BikeService) => {
    expect(component).toBeTruthy();
  }));
});
