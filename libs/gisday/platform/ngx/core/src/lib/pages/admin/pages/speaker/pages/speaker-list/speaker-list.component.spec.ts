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

/**
 * #441: the Sessions column, each speaker's sessions in the selected season, and "Only speakers in no session" (#439): a
 * speaker copied into a season is listed in it whether or not they speak in it, and could not be told apart from one who does.
 */
describe('SpeakerListComponent, the sessions each speaker is in (#441)', () => {
  const speakers = [
    {
      guid: 'sp-1',
      firstName: 'Ana',
      lastName: 'Ruiz',
      events: [
        { guid: 'e-1', name: 'Mapathon' },
        { guid: 'e-2', name: 'Drone flights' }
      ]
    },
    { guid: 'sp-2', firstName: 'Ben', lastName: 'Ortiz', events: [] }
  ];

  function open() {
    TestBed.configureTestingModule({
      imports: [SpeakerListComponent],
      providers: [
        provideRouter([]),
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(speakers), getEntitiesForSeason: () => of(speakers), getEntities: () => of(speakers) } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(SpeakerListComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const rows = () => {
      fixture.detectChanges();

      return Array.from(element.querySelectorAll('tbody tr')).map((row) => row.textContent ?? '');
    };
    const noSessionBox = () =>
      Array.from(element.querySelectorAll('tamu-gisc-checkbox')).find((box) =>
        box.textContent?.includes('Only speakers in no session')
      );

    return { fixture, rows, noSessionBox };
  }

  it("shows each speaker's sessions, and None for a speaker in no session", () => {
    const { rows } = open();

    const ana = rows().find((row) => row.includes('Ana'));
    const ben = rows().find((row) => row.includes('Ben'));

    expect(ana).toContain('Mapathon');
    expect(ana).toContain('Drone flights');
    expect(ben).toContain('None');
  });

  it('offers "Only speakers in no session", which leaves only the speaker in none, and every one again when unticked', () => {
    const { rows, noSessionBox } = open();

    expect(rows()).toHaveLength(2);
    expect(noSessionBox()).toBeTruthy();

    (noSessionBox()?.querySelector('input') as HTMLInputElement).click();

    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain('Ben');

    (noSessionBox()?.querySelector('input') as HTMLInputElement).click();

    expect(rows()).toHaveLength(2);
  });
});
