import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AlertModalComponent, AlertModalData } from './alert-modal.component';
import { ModalRefService, MODAL_DATA } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

describe('AlertModalComponent', () => {
  let component: AlertModalComponent;
  let fixture: ComponentFixture<AlertModalComponent>;
  let mockModalRef: jest.Mocked<ModalRefService>;
  let mockSettingsService: Partial<SettingsService>;

  beforeEach(async () => {
    mockModalRef = {
      closeSignal: { next: jest.fn() } as any,
      close: jest.fn()
    } as unknown as jest.Mocked<ModalRefService>;

    mockSettingsService = {
      updateSettings: jest.fn()
    } as unknown as Partial<SettingsService>;

    await TestBed.configureTestingModule({
      declarations: [AlertModalComponent],
      providers: [
        { provide: ModalRefService, useValue: mockModalRef },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    const data: AlertModalData = {
      title: 'Test',
      message: 'Message',
      primaryText: 'OK',
      secondaryText: 'Cancel',
      persistKey: 'test_key'
    };

    fixture = TestBed.createComponent(AlertModalComponent);
    component = fixture.componentInstance;

    // inject MODAL_DATA manually
    (component as any).data = data;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('primary() should persist when persistKey provided and close modal', () => {
    const ss = TestBed.inject(SettingsService) as unknown as SettingsService;
    const mr = TestBed.inject(ModalRefService) as ModalRefService;

    component.primary();

    expect((ss.updateSettings as jest.Mock).mock.calls.length).toBe(1);
    expect((ss.updateSettings as jest.Mock).mock.calls[0][0]).toEqual({ test_key: true });
    expect((mr.close as jest.Mock).mock.calls.length).toBe(1);
    expect((mr.close as jest.Mock).mock.calls[0][0]).toBe(true);
  });

  it('secondary() should close modal with false and not persist', () => {
    const ss = TestBed.inject(SettingsService) as unknown as SettingsService;
    const mr = TestBed.inject(ModalRefService) as ModalRefService;

    component.secondary();

    expect((ss.updateSettings as jest.Mock).mock.calls.length).toBe(0);
    expect((mr.close as jest.Mock).mock.calls.length).toBe(1);
    expect((mr.close as jest.Mock).mock.calls[0][0]).toBe(false);
  });
});
