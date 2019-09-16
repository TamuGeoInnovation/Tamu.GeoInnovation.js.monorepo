import { inject, TestBed } from '@angular/core/testing';

import { ParkingService } from './parking.service';

describe('ParkingService', () => {
  it('should be created', () => {
    inject([ParkingService], (component: ParkingService) => {
      expect(component).toBeTruthy();
    });
  });
});
