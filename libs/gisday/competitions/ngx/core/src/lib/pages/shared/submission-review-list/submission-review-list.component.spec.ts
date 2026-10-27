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
      open: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<ModalService>;

    await TestBed.configureTestingModule({
      imports: [SubmissionReviewListComponent],
      providers: [{ provide: ModalService, useValue: mockModalService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionReviewListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('submissions$', of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal on row click', () => {
    const mockSubmission = {
      guid: 'test-guid',
      created: new Date(),
      questionValue: 'Test Question',
      validationStatus: 'unverified',
      location: { latitude: 0, longitude: 0 },
      imageGuids: []
    };

    // onRowClick returns early unless event.type is 'click'. The original event omitted
    // type, so the guard short-circuited and the modal was never opened.
    component.onRowClick({ type: 'click', row: mockSubmission } as never);

    expect(mockModalService.open).toHaveBeenCalled();
  });

  /**
   * #2428 review: after an admin discards or unverifies a row the app verified, the row must not credit
   * the app with that decision.
   */
  it('says "by app" only while a row the app verified is still verified', () => {
    const row = (validationStatus: string, verifiedAutomatically: boolean) => ({ validationStatus, verifiedAutomatically }) as never;

    expect(component.verifiedByApp(row('verified', true))).toBe(true);
    expect(component.verifiedByApp(row('discarded', true))).toBe(false);
    expect(component.verifiedByApp(row('unverified', true))).toBe(false);
    expect(component.verifiedByApp(row('verified', false))).toBe(false);
  });
});
