import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AlertModalComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

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
    component = TestBed.configureTestingModule({
      providers: [
        { provide: ResponsiveService, useValue: {} },
        { provide: EnvironmentService, useValue: {} },
        { provide: ModalService, useValue: mockModalService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: TestingService, useValue: {} }
      ]
    }).runInInjectionContext(() => new MapComponent());
  });

  it('should open AlertModal and persist beta ack when acknowledged', () => {
    component.openBetaModal(true);

    expect((mockModalService.open as jest.Mock).mock.calls.length).toBe(1);

    const callArgs = (mockModalService.open as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe(AlertModalComponent);
  });
});
