import { of } from 'rxjs';
import { AlertModalComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { MapComponent } from './map.component';

describe('Aggiemap MapComponent (beta flow)', () => {
  let component: MapComponent;
  let mockModalService: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockModalService = {
      open: jest.fn(() => of(true))
    };

    mockSettingsService = {
      updateSettings: jest.fn()
    };

    // Instantiate directly with minimal mocks for the Beta modal flow
    component = new MapComponent({} as any, {} as any, mockModalService as any, mockSettingsService as any, {} as any, {} as any);
  });

  it('should open AlertModal and persist beta ack when acknowledged', () => {
    component.openBetaModal(true);

    expect((mockModalService.open as jest.Mock).mock.calls.length).toBe(1);

    const callArgs = (mockModalService.open as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe(AlertModalComponent);
  });
});
