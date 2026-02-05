import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { UserSubmissionsComponent } from './user-submissions.component';

describe('UserSubmissionsComponent', () => {
  let component: UserSubmissionsComponent;
  let fixture: ComponentFixture<UserSubmissionsComponent>;
  let mockSubmissionService: jest.Mocked<SubmissionService>;
  let mockSettingsService: jest.Mocked<SettingsService>;
  let mockEnvService: jest.Mocked<EnvironmentService>;

  beforeEach(async () => {
    mockSubmissionService = {
      getUserSubmissions: jest.fn().mockReturnValue(of([]))
    } as unknown as jest.Mocked<SubmissionService>;

    mockSettingsService = {
      getSimpleSettingsBranch: jest.fn().mockReturnValue(of({ guid: 'user-guid' }))
    } as unknown as jest.Mocked<SettingsService>;

    mockEnvService = {
      value: jest.fn().mockReturnValue({ subKey: 'test-key' })
    } as unknown as jest.Mocked<EnvironmentService>;

    await TestBed.configureTestingModule({
      declarations: [UserSubmissionsComponent],
      providers: [
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: EnvironmentService, useValue: mockEnvService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSubmissionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user submissions on init', () => {
    component.ngOnInit();
    expect(mockSettingsService.getSimpleSettingsBranch).toHaveBeenCalled();
    expect(mockSubmissionService.getUserSubmissions).toHaveBeenCalled();
  });
});
