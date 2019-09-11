import { inject } from '@angular/core/testing';

import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  it('should be created', () => {
    inject([EnvironmentService], (environmentService: EnvironmentService) => {
      expect(environmentService).toBeTruthy();
    });
  });
});
