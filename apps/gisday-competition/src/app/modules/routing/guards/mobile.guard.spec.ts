import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';


import { DeviceGuard } from './device.guard';

describe('DeviceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [DeviceGuard]
    });
  });

  it('should ...', inject([DeviceGuard], (guard: DeviceGuard) => {
    expect(guard).toBeTruthy();
  }));
});
