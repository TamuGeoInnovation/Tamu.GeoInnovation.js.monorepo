import { inject } from '@angular/core/testing';

import { ResponsiveService } from './responsive.service';

describe('ResponsiveService', () => {
  it('should be created', () => {
    inject([ResponsiveService], (responsiveService: ResponsiveService) => {
      expect(responsiveService).toBeTruthy();
    });
  });
});
