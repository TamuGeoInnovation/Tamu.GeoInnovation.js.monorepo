import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import {
  AssetsService,
  BroadcastService,
  ClassService,
  EventService,
  JudgingService,
  LocationService,
  OrganizationService,
  PlaceService,
  SeasonService,
  SessionFilesService,
  SpeakerEditsService,
  SpeakerService,
  SponsorService,
  TagService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { GISDAY_SITE } from '../../../site/site';

import { BroadcastAddEditFormComponent } from './broadcasts/broadcast-add-edit-form/broadcast-add-edit-form.component';
import { ClassAddEditFormComponent } from './classes/class-add-edit-form/class-add-edit-form.component';
import { EventAddEditFormComponent } from './events/event-add-edit-form/event-add-edit-form.component';
import { EventLocationAddEditFormComponent } from './event-locations/event-location-add-edit-form/event-location-add-edit-form.component';
import { OrganizationAddEditFormComponent } from './organizations/organization-add-edit-form/organization-add-edit-form.component';
import { PlaceLocationAddEditFormComponent } from './places/place-location-add-edit-form/place-location-add-edit-form.component';
import { SeasonAddEditFormComponent } from './seasons/season-add-edit-form/season-add-edit-form.component';
import { SpeakerAddEditFormComponent } from './speakers/speaker-add-edit-form/speaker-add-edit-form.component';
import { SponsorAddEditFormComponent } from './sponsors/sponsor-add-edit-form/sponsor-add-edit-form.component';
import { TagAddEditFormComponent } from './tags/tag-add-edit-form/tag-add-edit-form.component';
import { UniversityAddEditFormComponent } from './universities/university-add-edit-form/university-add-edit-form.component';

// A save goes back to its list page. Any address is a page here, so that navigation resolves; under Jest a rejected
// one went unnoticed, and Vitest reports it as an unhandled error (#1977).
const anyPage = [{ path: '**', children: [] }];

type Toast = { id: string; title: string; message: string };
type Form = { form: { patchValue(value: object): void }; handleSubmission(): void; deleteEntity(): void; ngOnInit(): void };

/**
 * A service whose every method answers `answer()`, and whose every stream (`activeSeason$`, `seasons$`) a made-up
 * season, so a form can be opened with nothing real behind it.
 */
function stub(answer: () => Observable<unknown>) {
  return new Proxy(
    {},
    {
      get: (_target, name: string) =>
        name.endsWith('$') ? of({ guid: 's-2027', year: 2027 }) : name === 'then' ? undefined : () => answer()
    }
  );
}

const SERVICES = [
  AssetsService,
  BroadcastService,
  ClassService,
  LocationService,
  OrganizationService,
  PlaceService,
  SeasonService,
  TagService,
  UniversityService,
  EventService,
  JudgingService,
  SessionFilesService,
  SpeakerEditsService,
  SpeakerService,
  SponsorService,
  ModalService
];

/** A refusal with no message of the API's own, so each form's own wording is what shows. */
const refused = () => throwError(() => ({ status: 500 }));

/** A refusal with the API's own reason, which a form shows in place of its own wording where it reads it (#3382). */
const refusedWithReason = () => throwError(() => ({ status: 422, error: { message: 'A made-up reason.' } }));

const ok = () => of({ guid: 'x-1' });

/** Opens `page` as a create or an edit, with `fill` in its form, does `act`, and answers what it said. */
function said<F extends Form>(
  page: Type<F>,
  fill: object,
  type: 'create' | 'edit',
  answer: () => Observable<unknown>,
  act: (form: F) => void
): Array<Toast> {
  const toast = vi.fn();

  TestBed.resetTestingModule();
  TestBed.overrideComponent(page, { set: { template: '', imports: [] } });
  TestBed.configureTestingModule({
    imports: [page],
    providers: [
      provideRouter(anyPage),
      { provide: NotificationService, useValue: { toast } },
      { provide: GISDAY_SITE, useValue: { name: 'A made-up site', off: [] } },
      ...SERVICES.map((service) => ({ provide: service, useValue: stub(answer) }))
    ]
  });

  const fixture = TestBed.createComponent(page);
  fixture.componentRef.setInput('type', type);
  const form = fixture.componentInstance;
  form.ngOnInit();
  form.form.patchValue(fill);
  act(form);

  return toast.mock.calls.map(([t]) => ({ id: t.id, title: t.title, message: t.message }));
}

/**
 * What each admin add/edit form says after a create, an update and a delete, worked or refused (#3340): the toasts'
 * ids, titles and messages. Pinned on today's code before the forms shared one way of saying it, and now in that
 * one way: the majority's ids (<noun>-<action>-success|failed), titles (Delete Event Location) and messages (Tag was
 * successfully deleted.). The class form's own create, for several sections at once, keeps its messages.
 */
describe.each([
  { name: 'tag', page: TagAddEditFormComponent, fill: {} },
  { name: 'university', page: UniversityAddEditFormComponent, fill: {} },
  { name: 'broadcast', page: BroadcastAddEditFormComponent, fill: { place: 'p-1' } },
  { name: 'event location', page: EventLocationAddEditFormComponent, fill: { place: 'p-1' } },
  { name: 'organization', page: OrganizationAddEditFormComponent, fill: {} },
  { name: 'class', page: ClassAddEditFormComponent, fill: { section: '501' } }
] as Array<{ name: string; page: Type<Form>; fill: object }>)('the $name form says (#3340)', ({ name, page, fill }) => {
  it('after each action, worked and refused', () => {
    const toasts = {
      created: said(page, fill, 'create', ok, (f) => f.handleSubmission()),
      notCreated: said(page, fill, 'create', refused, (f) => f.handleSubmission()),
      updated: said(page, fill, 'edit', ok, (f) => f.handleSubmission()),
      notUpdated: said(page, fill, 'edit', refused, (f) => f.handleSubmission()),
      deleted: said(page, fill, 'edit', ok, (f) => f.deleteEntity()),
      notDeleted: said(page, fill, 'edit', refused, (f) => f.deleteEntity())
    };

    expect(toasts).toEqual(SAID[name]);
  });
});

/** A form's own save and delete, by the names it has: the season form has no create, and saves with updateEntity. */
type Acts = { create?: (f: Form) => void; update: (f: Form) => void; delete: (f: Form) => void };

const submitted: Acts = {
  create: (f) => f.handleSubmission(),
  update: (f) => f.handleSubmission(),
  delete: (f) => f.deleteEntity()
};

// The event form sends only a complete event (#1773); its save is reached past that check, which is not what is pinned.
const eventSaves = (f: Form) => (f as unknown as { _createEntity(): void })._createEntity();
const eventUpdates = (f: Form) => (f as unknown as { _updateEntity(): void })._updateEntity();

/**
 * What the other five admin forms say (#3382), pinned the same way: after each action, worked, refused, and refused
 * with the API's own reason. Pinned on the first PR's code, and now in its one way: titles in title case (season,
 * event), and the API's reason shown by every form (place and speaker showed only the status on a delete).
 */
describe.each([
  { name: 'sponsor', page: SponsorAddEditFormComponent, acts: submitted },
  { name: 'place', page: PlaceLocationAddEditFormComponent, acts: submitted },
  { name: 'speaker', page: SpeakerAddEditFormComponent, acts: submitted },
  {
    name: 'season',
    page: SeasonAddEditFormComponent,
    acts: {
      update: (f: Form) => (f as unknown as { updateEntity(): void }).updateEntity(),
      delete: (f: Form) => f.deleteEntity()
    }
  },
  {
    name: 'event',
    page: EventAddEditFormComponent,
    acts: { create: eventSaves, update: eventUpdates, delete: (f: Form) => f.deleteEntity() }
  }
] as Array<{ name: string; page: Type<Form>; acts: Acts }>)('the $name form says (#3382)', ({ name, page, acts }) => {
  it('after each action, worked, refused and refused with a reason', () => {
    const toasts: Record<string, Array<Toast>> = {};

    if (acts.create) {
      toasts.created = said(page, {}, 'create', ok, acts.create);
      toasts.notCreated = said(page, {}, 'create', refused, acts.create);
    }

    toasts.updated = said(page, {}, 'edit', ok, acts.update);
    toasts.notUpdated = said(page, {}, 'edit', refused, acts.update);
    toasts.deleted = said(page, {}, 'edit', ok, acts.delete);
    toasts.notDeleted = said(page, {}, 'edit', refused, acts.delete);
    toasts.notDeletedWithReason = said(page, {}, 'edit', refusedWithReason, acts.delete);

    expect(toasts).toEqual(SAID_TOO[name]);
  });
});

const SAID_TOO: Record<string, Record<string, Array<Toast>>> = {
  sponsor: {
    created: [{ id: 'sponsor-create-success', title: 'Create Sponsor', message: 'Sponsor was successfully created.' }],
    notCreated: [{ id: 'sponsor-create-failed', title: 'Create Sponsor', message: 'Error creating sponsor: 500' }],
    updated: [{ id: 'sponsor-update-success', title: 'Update Sponsor', message: 'Sponsor was successfully updated.' }],
    notUpdated: [{ id: 'sponsor-update-failed', title: 'Update Sponsor', message: 'Error updating sponsor: 500' }],
    deleted: [{ id: 'sponsor-delete-success', title: 'Delete Sponsor', message: 'Sponsor was successfully deleted.' }],
    notDeleted: [{ id: 'sponsor-delete-failed', title: 'Delete Sponsor', message: 'Error deleting sponsor: 500' }],
    notDeletedWithReason: [{ id: 'sponsor-delete-failed', title: 'Delete Sponsor', message: 'A made-up reason.' }]
  },
  // The place form says Organization, as its titles, button and the admin menu do (#3398): its toasts said Place.
  place: {
    created: [
      { id: 'organization-create-success', title: 'Create Organization', message: 'Organization was successfully created.' }
    ],
    notCreated: [
      { id: 'organization-create-failed', title: 'Create Organization', message: 'Error creating organization: 500' }
    ],
    updated: [
      { id: 'organization-update-success', title: 'Update Organization', message: 'Organization was successfully updated.' }
    ],
    notUpdated: [
      { id: 'organization-update-failed', title: 'Update Organization', message: 'Error updating organization: 500' }
    ],
    deleted: [
      { id: 'organization-delete-success', title: 'Delete Organization', message: 'Organization was successfully deleted.' }
    ],
    notDeleted: [
      { id: 'organization-delete-failed', title: 'Delete Organization', message: 'Error deleting organization: 500' }
    ],
    notDeletedWithReason: [{ id: 'organization-delete-failed', title: 'Delete Organization', message: 'A made-up reason.' }]
  },
  speaker: {
    created: [{ id: 'speaker-create-success', title: 'Create Speaker', message: 'Speaker was successfully created.' }],
    notCreated: [{ id: 'speaker-create-failed', title: 'Create Speaker', message: 'Error creating speaker: 500' }],
    updated: [{ id: 'speaker-update-success', title: 'Update Speaker', message: 'Speaker was successfully updated.' }],
    notUpdated: [{ id: 'speaker-update-failed', title: 'Update Speaker', message: 'Error updating speaker: 500' }],
    deleted: [{ id: 'speaker-delete-success', title: 'Delete Speaker', message: 'Speaker was successfully deleted.' }],
    notDeleted: [{ id: 'speaker-delete-failed', title: 'Delete Speaker', message: 'Error deleting speaker: 500' }],
    notDeletedWithReason: [{ id: 'speaker-delete-failed', title: 'Delete Speaker', message: 'A made-up reason.' }]
  },
  season: {
    updated: [{ id: 'season-update-success', title: 'Update Season', message: 'Season was successfully updated.' }],
    notUpdated: [{ id: 'season-update-failed', title: 'Update Season', message: 'Error updating season: 500' }],
    deleted: [{ id: 'season-delete-success', title: 'Delete Season', message: 'Season was successfully deleted.' }],
    notDeleted: [{ id: 'season-delete-failed', title: 'Delete Season', message: 'Error deleting season: 500' }],
    notDeletedWithReason: [{ id: 'season-delete-failed', title: 'Delete Season', message: 'A made-up reason.' }]
  },
  event: {
    created: [{ id: 'event-create-success', title: 'Create Event', message: 'Event was successfully created.' }],
    notCreated: [{ id: 'event-create-failed', title: 'Create Event', message: 'Error creating event: 500' }],
    updated: [{ id: 'event-update-success', title: 'Update Event', message: 'Event was successfully updated.' }],
    notUpdated: [{ id: 'event-update-failed', title: 'Update Event', message: 'Error updating event: 500' }],
    deleted: [{ id: 'event-delete-success', title: 'Delete Event', message: 'Event was successfully deleted.' }],
    notDeleted: [{ id: 'event-delete-failed', title: 'Delete Event', message: 'Error deleting event: 500' }],
    notDeletedWithReason: [{ id: 'event-delete-failed', title: 'Delete Event', message: 'A made-up reason.' }]
  }
};

const SAID: Record<string, Record<string, Array<Toast>>> = {
  tag: {
    created: [{ id: 'tag-create-success', title: 'Create Tag', message: 'Tag was successfully created.' }],
    notCreated: [{ id: 'tag-create-failed', title: 'Create Tag', message: 'Error creating tag: 500' }],
    updated: [{ id: 'tag-update-success', title: 'Update Tag', message: 'Tag was successfully updated.' }],
    notUpdated: [{ id: 'tag-update-failed', title: 'Update Tag', message: 'Error updating tag: 500' }],
    deleted: [{ id: 'tag-delete-success', title: 'Delete Tag', message: 'Tag was successfully deleted.' }],
    notDeleted: [{ id: 'tag-delete-failed', title: 'Delete Tag', message: 'Error deleting tag: 500' }]
  },
  university: {
    created: [
      { id: 'university-create-success', title: 'Create University', message: 'University was successfully created.' }
    ],
    notCreated: [{ id: 'university-create-failed', title: 'Create University', message: 'Error creating university: 500' }],
    updated: [
      { id: 'university-update-success', title: 'Update University', message: 'University was successfully updated.' }
    ],
    notUpdated: [{ id: 'university-update-failed', title: 'Update University', message: 'Error updating university: 500' }],
    deleted: [
      { id: 'university-delete-success', title: 'Delete University', message: 'University was successfully deleted.' }
    ],
    notDeleted: [{ id: 'university-delete-failed', title: 'Delete University', message: 'Error deleting university: 500' }]
  },
  broadcast: {
    created: [{ id: 'broadcast-create-success', title: 'Create Broadcast', message: 'Broadcast was successfully created.' }],
    notCreated: [{ id: 'broadcast-create-failed', title: 'Create Broadcast', message: 'Error creating broadcast: 500' }],
    updated: [{ id: 'broadcast-update-success', title: 'Update Broadcast', message: 'Broadcast was successfully updated.' }],
    notUpdated: [{ id: 'broadcast-update-failed', title: 'Update Broadcast', message: 'Error updating broadcast: 500' }],
    deleted: [{ id: 'broadcast-delete-success', title: 'Delete Broadcast', message: 'Broadcast was successfully deleted.' }],
    notDeleted: [{ id: 'broadcast-delete-failed', title: 'Delete Broadcast', message: 'Error deleting broadcast: 500' }]
  },
  'event location': {
    created: [
      {
        id: 'event-location-create-success',
        title: 'Create Event Location',
        message: 'Event location was successfully created.'
      }
    ],
    notCreated: [
      { id: 'event-location-create-failed', title: 'Create Event Location', message: 'Error creating event location: 500' }
    ],
    updated: [
      {
        id: 'event-location-update-success',
        title: 'Update Event Location',
        message: 'Event location was successfully updated.'
      }
    ],
    notUpdated: [
      { id: 'event-location-update-failed', title: 'Update Event Location', message: 'Error updating event location: 500' }
    ],
    deleted: [
      {
        id: 'event-location-delete-success',
        title: 'Delete Event Location',
        message: 'Event location was successfully deleted.'
      }
    ],
    notDeleted: [
      { id: 'event-location-delete-failed', title: 'Delete Event Location', message: 'Error deleting event location: 500' }
    ]
  },
  organization: {
    created: [
      { id: 'organization-create-success', title: 'Create Organization', message: 'Organization was successfully created.' }
    ],
    notCreated: [
      { id: 'organization-create-failed', title: 'Create Organization', message: 'Error creating organization: 500' }
    ],
    updated: [
      { id: 'organization-update-success', title: 'Update Organization', message: 'Organization was successfully updated.' }
    ],
    notUpdated: [
      { id: 'organization-update-failed', title: 'Update Organization', message: 'Error updating organization: 500' }
    ],
    deleted: [
      { id: 'organization-delete-success', title: 'Delete Organization', message: 'Organization was successfully deleted.' }
    ],
    notDeleted: [
      { id: 'organization-delete-failed', title: 'Delete Organization', message: 'Error deleting organization: 500' }
    ]
  },
  class: {
    created: [{ id: 'class-create-success', title: 'Create Class', message: 'Class was successfully created.' }],
    notCreated: [{ id: 'class-create-failed', title: 'Create Class', message: 'Error creating class: 500' }],
    updated: [{ id: 'class-update-success', title: 'Update Class', message: 'Class was successfully updated.' }],
    notUpdated: [{ id: 'class-update-failed', title: 'Update Class', message: 'Error updating class: 500' }],
    deleted: [{ id: 'class-delete-success', title: 'Delete Class', message: 'Class was successfully deleted.' }],
    notDeleted: [{ id: 'class-delete-failed', title: 'Delete Class', message: 'Error deleting class: 500' }]
  }
};
