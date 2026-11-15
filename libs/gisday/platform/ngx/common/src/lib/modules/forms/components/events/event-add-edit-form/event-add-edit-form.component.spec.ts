import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import {
  BroadcastService,
  EventService,
  LocationService,
  SeasonService,
  SpeakerEditsService,
  SpeakerService,
  TagService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { GISDAY_SITES, GisdaySite } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE } from '../../../../../site/site';
import { EventAddEditFormComponent } from './event-add-edit-form.component';
import { ReviewEmailModalComponent } from '../../../../modals/review-email-modal/review-email-modal.component';

/**
 * #2706. "Is accepting RSVPs?" starts ticked on a new event, as the database column's default is, so an event made in the
 * admin pages accepts RSVPs unless the organizer unticks it. On 6 November 2026 every one of the 45 active events on each
 * site had been saved with it off.
 */
describe('EventAddEditFormComponent', () => {
  let speakerEdits: { preview: jest.Mock; send: jest.Mock };
  let modals: { open: jest.Mock };

  function create(type: 'create' | 'edit', event?: object, seasonSpeakers: Array<object> = []) {
    speakerEdits = { preview: jest.fn(() => of({ groups: [] })), send: jest.fn(() => of({ sent: [], skipped: [] })) };
    modals = { open: jest.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(seasonSpeakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: ModalService, useValue: modals }
      ]
    });
    // The form's own setup is what is under test, not its template.
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.componentInstance.ngOnInit();

    return fixture.componentInstance;
  }

  it('starts a new event accepting RSVPs, as the database does', () => {
    expect(create('create').form.getRawValue().isAcceptingRsvps).toBe(true);
  });

  it('keeps what an existing event has', () => {
    const form = create('edit', { guid: 'event', name: 'A workshop', isAcceptingRsvps: false, speakers: [], tags: [] }).form;

    expect(form.getRawValue().isAcceptingRsvps).toBe(false);
  });

  /** #2940. An event's speakers, on its edit page, by last name and then first name, not in the order they were added. */
  describe("the event's speakers", () => {
    const person = (guid: string, firstName: string, lastName: string) => ({ guid, firstName, lastName });
    const zheng = person('1', 'Sunny', 'Zheng');
    const ablack = person('2', 'Ethan', 'Ablack');
    const beaneB = person('3', 'Brooke', 'Beane');
    const beaneA = person('4', 'Alex', 'Beane');
    const names = (speakers: Array<{ firstName?: string; lastName?: string }>) =>
      speakers.map((s) => `${s.firstName} ${s.lastName}`);

    it('are listed by last name, then first name, when the page opens', async () => {
      const form = create('edit', { guid: 'event', speakers: [zheng, beaneB, ablack, beaneA], tags: [] });

      expect(names(await firstValueFrom(form.eventSpeakers$))).toEqual([
        'Ethan Ablack',
        'Alex Beane',
        'Brooke Beane',
        'Sunny Zheng'
      ]);
    });

    it('stay in that order when one is added', () => {
      const form = create('edit', { guid: 'event', speakers: [zheng], tags: [] }, [zheng, ablack]);
      const shown: Array<Array<{ firstName?: string; lastName?: string }>> = [];
      const watching = form.eventSpeakers$.subscribe((speakers) => shown.push(speakers));

      form.patchSpeaker(ablack, 'add');
      watching.unsubscribe();

      expect(names(shown[shown.length - 1])).toEqual(['Ethan Ablack', 'Sunny Zheng']);
    });
  });
});

/** #3023: the event's own "Email speakers their edit links" shows the email first, editable, as the other two places do. */
describe('EventAddEditFormComponent, the profile email', () => {
  it("shows the email for the event's speakers first, then sends it as edited", () => {
    const speakerEdits = { preview: jest.fn(() => of({ groups: [] })), send: jest.fn(() => of({ sent: [], skipped: [] })) };
    const modals = { open: jest.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of({ guid: 'event', speakers: [{ guid: 'sp-1', lastName: 'Abe' }, { guid: 'sp-2', lastName: 'Bo' }] }) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: ModalService, useValue: modals }
      ]
    });
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.emailSpeakersEditLinks();

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send profile email', editableSubject: true }) })
    );
    expect(speakerEdits.preview).toHaveBeenCalledWith(['sp-1', 'sp-2']);
    expect(speakerEdits.send).toHaveBeenCalledWith(['sp-1', 'sp-2'], { subject: 'Profile', template: 'Hi {edit link}' });
  });
});

/**
 * #3048. An event's Broadcast drop-down on gisday.tamu.edu listed every organization's Zooms, so another university's
 * could be picked for a Texas A&M session by mistake. It lists the site's own, those with no place yet, and the one the
 * event already has, whoever's it is, so opening an event never drops its broadcast.
 */
describe('EventAddEditFormComponent, the Broadcast drop-down', () => {
  const tamu = { guid: 'tamu', name: 'Texas A&M University GIS Day(s)' };
  const ttu = { guid: 'ttu', name: 'Texas Tech University GIS Day' };
  const broadcasts = [
    { guid: 'b-tamu', name: 'TAMU Zoom 1', place: tamu },
    { guid: 'b-ttu', name: 'TTU 1', place: ttu },
    { guid: 'b-ttu-2', name: 'TTU 2', place: ttu },
    { guid: 'b-none', name: 'Unplaced Zoom', place: null }
  ];

  async function listed(site: GisdaySite, type: 'create' | 'edit', event?: object) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: site },
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of(broadcasts) } },
        { provide: EventService, useValue: { getEntity: () => of(event) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: ModalService, useValue: {} }
      ]
    });
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.componentInstance.ngOnInit();

    return (await firstValueFrom(fixture.componentInstance.broadcasts$)).map((b) => b.name);
  }

  it("lists only the site's own broadcasts on gisday.tamu.edu, and those with no place yet", async () => {
    expect(await listed(GISDAY_SITES.tamu, 'create')).toEqual(['TAMU Zoom 1', 'Unplaced Zoom']);
  });

  it("keeps the event's own broadcast, though it is another organization's", async () => {
    const event = { guid: 'event', speakers: [], tags: [], broadcast: { guid: 'b-ttu', name: 'TTU 1' } };

    expect(await listed(GISDAY_SITES.tamu, 'edit', event)).toEqual(['TAMU Zoom 1', 'TTU 1', 'Unplaced Zoom']);
  });

  it("lists every organization's broadcasts on txgisday.org", async () => {
    expect(await listed(GISDAY_SITES.txgisday, 'create')).toHaveLength(4);
  });
});
