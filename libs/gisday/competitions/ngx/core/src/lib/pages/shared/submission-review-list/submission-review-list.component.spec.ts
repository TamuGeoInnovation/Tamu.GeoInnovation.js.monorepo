import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { SubmissionReviewListComponent } from './submission-review-list.component';

describe('SubmissionReviewListComponent', () => {
  let component: SubmissionReviewListComponent;
  let fixture: ComponentFixture<SubmissionReviewListComponent>;
  let mockModalService: jest.Mocked<ModalService>;

  beforeEach(async () => {
    mockModalService = {
      open: jest.fn()
    } as unknown as jest.Mocked<ModalService>;

    await TestBed.configureTestingModule({
      declarations: [SubmissionReviewListComponent],
      providers: [{ provide: ModalService, useValue: mockModalService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionReviewListComponent);
    component = fixture.componentInstance;
    component.submissions$ = of([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal on row click', () => {
    const mockSubmission = {
      guid: 'test-guid',
      created: new Date(),
      questionValue: 'Test Question',
      pointValue: 5,
      validationStatus: 'unverified',
      location: { latitude: 0, longitude: 0 },
      imageGuids: []
    };

    component.onRowClick({ row: mockSubmission });

    expect(mockModalService.open).toHaveBeenCalled();
  });
});
