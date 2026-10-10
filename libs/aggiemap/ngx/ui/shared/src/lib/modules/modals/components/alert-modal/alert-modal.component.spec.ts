import { TestBed } from '@angular/core/testing';
import { AlertModalComponent, AlertModalData } from './alert-modal.component';
import {
  SelectComponent,
  CheckboxComponent,
  CheckboxGroupComponent,
  DateTimePickerComponent,
  TextboxComponent,
  AutocompleteComponent,
  AutocompleteOptionTemplateDirective,
  ButtonComponent,
  FileComponent,
  RadioGroupComponent,
  RangeComponent,
  SlideToggleComponent,
  SelectListComponent,
  TurnstileChallengeComponent
} from '@tamu-gisc/ui-kits/ngx/forms';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

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

    // Constructed directly, without rendering the template.
    component = TestBed.configureTestingModule({
      providers: [
        { provide: ModalRefService, useValue: mockModalRef },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: MODAL_DATA, useValue: data }
      ]
    }).runInInjectionContext(() => new AlertModalComponent());
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

describe('AlertModalComponent template', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectComponent,
        CheckboxComponent,
        CheckboxGroupComponent,
        DateTimePickerComponent,
        TextboxComponent,
        AutocompleteComponent,
        AutocompleteOptionTemplateDirective,
        ButtonComponent,
        FileComponent,
        RadioGroupComponent,
        RangeComponent,
        SlideToggleComponent,
        SelectListComponent,
        TurnstileChallengeComponent,
        AlertModalComponent
      ],
      providers: [
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        { provide: SettingsService, useValue: { updateSettings: jest.fn() } },
        { provide: MODAL_DATA, useValue: { title: 'Test', message: 'Message', primaryText: 'OK' } }
      ]
    }).compileComponents();
  });

  it('should render with the shared button component', () => {
    const fixture = TestBed.createComponent(AlertModalComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tamu-gisc-button')).toBeTruthy();
  });
});
