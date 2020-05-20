import { TestBed } from '@angular/core/testing';

import { AccountPreferencesService } from './account-preferences.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('AccountPreferencesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, EnvironmentModule],
    providers: [
      {
        provide: env, 
        useValue: { api_url : 'https://' }
      }
    ]
  }));

  it('should be created', () => {
    const service: AccountPreferencesService = TestBed.get(AccountPreferencesService);
    expect(service).toBeTruthy();
  });
});
