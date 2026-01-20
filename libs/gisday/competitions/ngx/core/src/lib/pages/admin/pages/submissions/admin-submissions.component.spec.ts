import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { AdminSubmissionsComponent } from './admin-submissions.component';

describe('AdminSubmissionsComponent', () => {
  let component: AdminSubmissionsComponent;
  let fixture: ComponentFixture<AdminSubmissionsComponent>;
  let mockSubmissionService: jest.Mocked<SubmissionService>;

  beforeEach(async () => {
    mockSubmissionService = {
      getAdminSubmissions: jest.fn().mockReturnValue(of([]))
    } as unknown as jest.Mocked<SubmissionService>;

    await TestBed.configureTestingModule({
      declarations: [AdminSubmissionsComponent],
      providers: [{ provide: SubmissionService, useValue: mockSubmissionService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubmissionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch admin submissions on init', () => {
    component.ngOnInit();
    expect(mockSubmissionService.getAdminSubmissions).toHaveBeenCalled();
  });
});
