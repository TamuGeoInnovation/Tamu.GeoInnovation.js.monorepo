import { TestBed } from '@angular/core/testing';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { InstallComponent } from './install.component';

/**
 * #1784: asking for location access waits through a slow first fix, says so only when access is
 * refused, and releases the watch once it has a position.
 */
describe('InstallComponent', () => {
  let ok: (p: unknown) => void;
  let fail: (e: unknown) => void;
  let clearWatch: jest.Mock;
  let toast: jest.Mock;
  let preset: jest.Mock;
  let component: InstallComponent;

  beforeEach(() => {
    clearWatch = jest.fn();
    (navigator as unknown as { geolocation: unknown }).geolocation = {
      watchPosition: jest.fn((o, f) => {
        ok = o;
        fail = f;

        return 3;
      }),
      clearWatch
    };

    toast = jest.fn();
    preset = jest.fn();
    TestBed.configureTestingModule({ providers: [{ provide: NotificationService, useValue: { toast, preset } }] });
    component = TestBed.runInInjectionContext(() => new InstallComponent());
  });

  it('waits through a timeout, then says access was granted and stops watching', () => {
    component.initiateLocationRequest();

    fail({ code: 3 });
    expect(preset).not.toHaveBeenCalled();
    expect(clearWatch).not.toHaveBeenCalled();

    ok({ coords: { latitude: 30.6, longitude: -96.3, accuracy: 10 }, timestamp: 1 });
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ id: 'location-request-success' }));
    expect(clearWatch).toHaveBeenCalledWith(3);
  });

  it('says location is unavailable when access is refused', () => {
    component.initiateLocationRequest();

    fail({ code: 1 });

    expect(preset).toHaveBeenCalledWith('no_gps');
    expect(toast).not.toHaveBeenCalled();
    expect(clearWatch).toHaveBeenCalledWith(3);
  });
});
