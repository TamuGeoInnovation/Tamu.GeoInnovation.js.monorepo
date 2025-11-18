import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ModalRef } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SubmissionDetailModalComponent } from './submission-detail-modal.component';

describe('SubmissionDetailModalComponent', () => {
  let component: SubmissionDetailModalComponent;
  let fixture: ComponentFixture<SubmissionDetailModalComponent>;
  let mockModalRef: jest.Mocked<ModalRef>;
  let mockSubmissionService: jest.Mocked<SubmissionService>;
  let mockSettingsService: jest.Mocked<SettingsService>;
  let mockEnvService: jest.Mocked<EnvironmentService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(async () => {
    const mockSubmission = {
      guid: 'test-guid',
      created: new Date(),
      questionValue: 'Test Question',
      pointValue: 5,
      validationStatus: 'unverified',
      location: { latitude: 0, longitude: 0 },
      imageGuids: []
    };

    mockModalRef = {
      config: {
        data: {
          submission: mockSubmission,
          isAdmin: false
        }
      },
      close: jest.fn()
    } as unknown as jest.Mocked<ModalRef>;

    mockSubmissionService = {
      getSubmissionImages: jest.fn().mockReturnValue(of([]))
    } as unknown as jest.Mocked<SubmissionService>;

    mockSettingsService = {} as jest.Mocked<SettingsService>;
    mockEnvService = {} as jest.Mocked<EnvironmentService>;
    mockNotificationService = {} as jest.Mocked<NotificationService>;
    mockSanitizer = {} as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      declarations: [SubmissionDetailModalComponent],
      providers: [
        { provide: ModalRef, useValue: mockModalRef },
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: EnvironmentService, useValue: mockEnvService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionDetailModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load submission images on init', () => {
    component.ngOnInit();
    expect(mockSubmissionService.getSubmissionImages).toHaveBeenCalledWith('test-guid');
  });

  it('should close modal when close is called', () => {
    component.close();
    expect(mockModalRef.close).toHaveBeenCalled();
  });
});
