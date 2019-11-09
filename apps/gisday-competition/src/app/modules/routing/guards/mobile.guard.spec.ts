import { TestBed, async, inject } from '@angular/core/testing';

import { DeviceGuard } from './device.guard';

describe('DeviceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeviceGuard]
    });
  });

  it('should ...', inject([DeviceGuard], (guard: DeviceGuard) => {
    expect(guard).toBeTruthy();
  }));
});
