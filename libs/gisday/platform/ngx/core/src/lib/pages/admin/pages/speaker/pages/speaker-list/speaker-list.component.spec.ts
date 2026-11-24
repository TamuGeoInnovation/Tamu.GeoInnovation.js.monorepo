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
 * #3370: at 390 px the list was 566 px wide, so the page scrolled sideways, and the season select was squeezed to a
 * sliver beside the heading. The table now scrolls in the admin dashboards' own box, whose specs show it scrolls content
 * wider than itself, so the page does not; and the toolbar wraps, putting the actions under the heading rather than
 * squeezing the select. The actions themselves do not wrap: the select is as wide as its row, and would fill one alone.
 */
describe('SpeakerListComponent on a phone (#3370)', () => {
  async function open() {
    const speakers = [{ guid: 'sp-1', firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.edu' }];

    TestBed.configureTestingModule({
      imports: [SpeakerListComponent],
      providers: [
        provideRouter([]),
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(speakers), getEntitiesForSeason: () => of(speakers), getEntities: () => of(speakers) } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const fixture = TestBed.createComponent(SpeakerListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('puts the table in the shared scroll box, so on a phone the table scrolls and the page does not', async () => {
    const root = await open();
    const table = root.querySelector('table.floating-table');

    expect(table).not.toBeNull();
    expect(table.closest('tamu-gisc-dashboard-scroll')).not.toBeNull();
    // Inside the box's own element that scrolls sideways, not beside it.
    expect(table.parentElement.classList).toContain('dashboard-scroll');
  });

  it('lets the toolbar wrap, so on a phone the season select goes under the heading rather than squeezing beside it', async () => {
    const root = await open();
    const toolbar = root.querySelector('.form-section-toolbar');

    expect(Array.from(toolbar.classList)).toEqual(expect.arrayContaining(['flex', 'flex-row', 'wrap']));
  });
});
