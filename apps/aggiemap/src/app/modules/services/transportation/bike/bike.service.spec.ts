import { inject, TestBed } from '@angular/core/testing';

import { Bike, BikeService } from './bike.service';
import { SelectComponent } from '../../../components/forms/select/select.component';

describe('BikeService', () => {
  it('should create', () => {
    inject([BikeService], (component: BikeService) => {
      expect(component).toBeTruthy();
    });
  });
});
