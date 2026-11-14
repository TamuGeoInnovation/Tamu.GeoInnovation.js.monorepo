import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import {
  BroadcastService,
  EventService,
  LocationService,
  SeasonService,
  SpeakerService,
  TagService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventAddEditFormComponent } from './event-add-edit-form.component';

/**
 * #2706. "Is accepting RSVPs?" starts ticked on a new event, as the database column's default is, so an event made in the
 * admin pages accepts RSVPs unless the organizer unticks it. On 6 November 2026 every one of the 45 active events on each
 * site had been saved with it off.
 */
describe('EventAddEditFormComponent', () => {
  function create(type: 'create' | 'edit', event?: object, seasonSpeakers: Array<object> = []) {
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
        { provide: NotificationService, useValue: { toast: jest.fn() } }
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
