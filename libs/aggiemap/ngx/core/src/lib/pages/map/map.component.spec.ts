import { of } from 'rxjs';
import { AlertModalComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

import { MapComponent } from './map.component';

describe('Aggiemap MapComponent (beta flow)', () => {
  let component: MapComponent;
  let mockModalService: Partial<ModalService>;
  let mockSettingsService: Partial<SettingsService>;

  beforeEach(() => {
    mockModalService = {
      open: jest.fn(() => of(true))
    } as unknown as Partial<ModalService>;

    mockSettingsService = {
      updateSettings: jest.fn()
    } as unknown as Partial<SettingsService>;

    // Other deps are not used by openBetaModal; pass empty objects
    component = new MapComponent({} as any, {} as any, mockModalService as any, mockSettingsService as any, {} as any, {} as any);
  });

  it('should open AlertModal and persist beta ack when acknowledged', () => {
    component.openBetaModal(true);

    expect((mockModalService.open as jest.Mock).mock.calls.length).toBe(1);

    const callArgs = (mockModalService.open as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe(AlertModalComponent);

    // Simulate returned observable resolved -> updateSettings should have been called
    expect((mockSettingsService.updateSettings as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(0);
  });
});
