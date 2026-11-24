import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService, SpeakerEditsService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ReviewEmailModalComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SpeakerListComponent } from './speaker-list.component';

/** #3023: Email edit links shows the profile email first, editable, as Research Competitions and an event do. */
describe('SpeakerListComponent, the profile email', () => {
  function open(confirmed: boolean) {
    const speakers = [{ guid: 'sp-1', firstName: 'Ana', lastName: 'Ruiz' }];
    const speakerEdits = { preview: jest.fn(() => of({ groups: [] })), send: jest.fn(() => of({ sent: ['Ana Ruiz'], skipped: [] })) };
    const modals = { open: jest.fn(() => of(confirmed ? { profile: 'Hi {edit link}', 'profile:subject': 'Profile' } : null)) };
    const toasts = { toast: jest.fn() };

    TestBed.configureTestingModule({
      imports: [SpeakerListComponent],
      providers: [
        provideRouter([]),
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(speakers), getEntitiesForSeason: () => of(speakers), getEntities: () => of(speakers) } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: modals },
        { provide: NotificationService, useValue: toasts }
      ]
    });

    const fixture = TestBed.createComponent(SpeakerListComponent);
    fixture.detectChanges();
    fixture.componentInstance.toggleRow('sp-1');
    fixture.componentInstance.emailEditLinks();

    return { speakerEdits, modals, toasts };
  }

  it('shows the email first, editable, then sends it as edited', () => {
    const { speakerEdits, modals, toasts } = open(true);

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send profile email', editableSubject: true }) })
    );
    expect(speakerEdits.preview).toHaveBeenCalledWith(['sp-1']);
    expect(speakerEdits.send).toHaveBeenCalledWith(['sp-1'], { subject: 'Profile', template: 'Hi {edit link}' });
    expect(toasts.toast).toHaveBeenCalled();
  });

  it('sends nothing when the admin cancels', () => {
    const { speakerEdits, toasts } = open(false);

    expect(speakerEdits.send).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
  });
});
