import { AlertModalComponent, AlertModalData } from './alert-modal.component';

describe('AlertModalComponent', () => {
  let component: AlertModalComponent;
  let mockModalRef: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockModalRef = {
      close: jest.fn()
    };

    mockSettingsService = {
      updateSettings: jest.fn()
    };

    const data: AlertModalData = {
      title: 'Test',
      message: 'Message',
      primaryText: 'OK',
      secondaryText: 'Cancel',
      persistKey: 'test_key'
    };

    // instantiate directly to avoid Angular TestBed injection complexities
    component = new AlertModalComponent(mockModalRef as any, mockSettingsService as any, data as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('primary() should persist when persistKey provided and close modal', () => {
    component.primary();

    expect(mockSettingsService.updateSettings).toHaveBeenCalledTimes(1);
    expect(mockSettingsService.updateSettings).toHaveBeenCalledWith({ test_key: true });
    expect(mockModalRef.close).toHaveBeenCalledTimes(1);
    expect(mockModalRef.close).toHaveBeenCalledWith(true);
  });

  it('secondary() should close modal with false and not persist', () => {
    component.secondary();

    expect(mockSettingsService.updateSettings).toHaveBeenCalledTimes(0);
    expect(mockModalRef.close).toHaveBeenCalledTimes(1);
    expect(mockModalRef.close).toHaveBeenCalledWith(false);
  });
});
