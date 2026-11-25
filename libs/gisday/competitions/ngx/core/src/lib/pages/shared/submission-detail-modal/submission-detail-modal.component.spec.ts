import type { Mocked } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import { SubmissionDetailModalComponent } from './submission-detail-modal.component';

describe('SubmissionDetailModalComponent', () => {
  let component: SubmissionDetailModalComponent;
  let fixture: ComponentFixture<SubmissionDetailModalComponent>;
  let mockModalRef: Mocked<ModalRefService>;
  let mockSubmissionService: Mocked<SubmissionService>;
  let mockSettingsService: Mocked<SettingsService>;
  let mockEnvService: Mocked<EnvironmentService>;
  let mockNotificationService: Mocked<NotificationService>;
  let mockSanitizer: Mocked<DomSanitizer>;

  beforeEach(async () => {
    const mockSubmission = {
      guid: 'test-guid',
      created: new Date(),
      questionValue: 'Test Question',
      validationStatus: 'unverified',
      location: { latitude: 0, longitude: 0 },
      imageGuids: []
    };

    const mockData = {
      submission: mockSubmission,
      isAdmin: false
    };

    mockModalRef = {
      close: vi.fn()
    } as unknown as Mocked<ModalRefService>;

    mockSubmissionService = {
      getSubmissionImages: vi.fn().mockReturnValue(of([]))
    } as unknown as Mocked<SubmissionService>;

    mockSettingsService = {} as Mocked<SettingsService>;
    mockEnvService = {} as Mocked<EnvironmentService>;
    mockNotificationService = {} as Mocked<NotificationService>;
    mockSanitizer = {} as Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [SubmissionDetailModalComponent],
      providers: [
        { provide: MODAL_DATA, useValue: mockData },
        { provide: ModalRefService, useValue: mockModalRef },
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: EnvironmentService, useValue: mockEnvService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        {
          // EsriMapService drags in SearchService -> HttpClient -> ActivatedRoute and more.
          // The component only reads `store`, so mock it rather than wiring the whole chain. Its map asks for
          // `makeMap`, which jsdom cannot draw: a map that never arrives, rather than a call that rejects unhandled (#1977).
          provide: EsriMapService,
          useValue: { store: of([]), makeMap: () => new Promise(() => undefined) }
        }
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
