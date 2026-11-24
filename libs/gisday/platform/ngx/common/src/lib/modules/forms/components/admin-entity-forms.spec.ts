import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import {
  AssetsService,
  BroadcastService,
  ClassService,
  LocationService,
  OrganizationService,
  PlaceService,
  SeasonService,
  TagService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BroadcastAddEditFormComponent } from './broadcasts/broadcast-add-edit-form/broadcast-add-edit-form.component';
import { ClassAddEditFormComponent } from './classes/class-add-edit-form/class-add-edit-form.component';
import { EventLocationAddEditFormComponent } from './event-locations/event-location-add-edit-form/event-location-add-edit-form.component';
import { OrganizationAddEditFormComponent } from './organizations/organization-add-edit-form/organization-add-edit-form.component';
import { TagAddEditFormComponent } from './tags/tag-add-edit-form/tag-add-edit-form.component';
import { UniversityAddEditFormComponent } from './universities/university-add-edit-form/university-add-edit-form.component';

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
  UniversityService
];

/** A refusal with no message of the API's own, so each form's own wording is what shows. */
const refused = () => throwError(() => ({ status: 500 }));

/**
 * What each admin add/edit form says after a create, an update and a delete, worked or refused (#3340): the toasts'
 * ids, titles and messages. Pinned on today's code before the forms share one way of saying it.
 */
describe.each([
  { name: 'tag', page: TagAddEditFormComponent, fill: {} },
  { name: 'university', page: UniversityAddEditFormComponent, fill: {} },
  { name: 'broadcast', page: BroadcastAddEditFormComponent, fill: { place: 'p-1' } },
  { name: 'event location', page: EventLocationAddEditFormComponent, fill: { place: 'p-1' } },
  { name: 'organization', page: OrganizationAddEditFormComponent, fill: {} },
  { name: 'class', page: ClassAddEditFormComponent, fill: { section: '501' } }
] as Array<{ name: string; page: Type<Form>; fill: object }>)('the $name form says (#3340)', ({ name, page, fill }) => {
  function said(type: 'create' | 'edit', answer: () => Observable<unknown>, act: (form: Form) => void): Array<Toast> {
    const toast = jest.fn();

    TestBed.resetTestingModule();
    TestBed.overrideComponent(page, { set: { template: '', imports: [] } });
    TestBed.configureTestingModule({
      imports: [page],
      providers: [
        provideRouter([]),
        { provide: NotificationService, useValue: { toast } },
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

  const ok = () => of({ guid: 'x-1' });

  it('after each action, worked and refused', () => {
    const toasts = {
      created: said('create', ok, (f) => f.handleSubmission()),
      notCreated: said('create', refused, (f) => f.handleSubmission()),
      updated: said('edit', ok, (f) => f.handleSubmission()),
      notUpdated: said('edit', refused, (f) => f.handleSubmission()),
      deleted: said('edit', ok, (f) => f.deleteEntity()),
      notDeleted: said('edit', refused, (f) => f.deleteEntity())
    };

    expect(toasts).toEqual(SAID[name]);
  });
});

const SAID: Record<string, Record<string, Array<Toast>>> = {
  tag: {
    created: [{ id: 'create-tag-success', title: 'Create Tag', message: 'Tag created successfully.' }],
    notCreated: [{ id: 'create-tag-error', title: 'Create Tag', message: 'Error creating tag: 500' }],
    updated: [{ id: 'update-tag-success', title: 'Update Tag', message: 'Tag updated successfully.' }],
    notUpdated: [{ id: 'update-tag-error', title: 'Update Tag', message: 'Error updating tag: 500' }],
    deleted: [{ id: 'delete-tag-success', title: 'Delete Tag', message: 'Tag deleted successfully.' }],
    notDeleted: [{ id: 'delete-tag-error', title: 'Delete Tag', message: 'Error deleting tag: 500' }]
  },
  university: {
    created: [{ id: 'university-create', title: 'Create University', message: 'University created successfully' }],
    notCreated: [{ id: 'university-create-error', title: 'Create University', message: 'Error creating university: 500' }],
    updated: [{ id: 'university-update', title: 'Update University', message: 'University updated successfully' }],
    notUpdated: [{ id: 'university-update-error', title: 'Update University', message: 'Error updating university: 500' }],
    deleted: [{ id: 'university-delete', title: 'Delete University', message: 'University deleted successfully' }],
    notDeleted: [{ id: 'university-delete-error', title: 'Delete University', message: 'Error deleting university: 500' }]
  },
  broadcast: {
    created: [{ id: 'create-broadcast-success', title: 'Create Broadcast', message: 'Broadcast created successfully.' }],
    notCreated: [{ id: 'create-broadcast-error', title: 'Create Broadcast', message: 'Error creating broadcast: 500' }],
    updated: [{ id: 'update-broadcast-success', title: 'Update Broadcast', message: 'Broadcast updated successfully.' }],
    notUpdated: [{ id: 'update-broadcast-error', title: 'Update Broadcast', message: 'Error updating broadcast: 500' }],
    deleted: [{ id: 'delete-broadcast-success', title: 'Delete Broadcast', message: 'Broadcast deleted successfully.' }],
    notDeleted: [{ id: 'delete-broadcast-error', title: 'Delete Broadcast', message: 'Error deleting broadcast: 500' }]
  },
  'event location': {
    created: [
      { id: 'create-event-location-success', title: 'Create Event Location', message: 'Event location created successfully.' }
    ],
    notCreated: [
      { id: 'create-event-location-error', title: 'Create Event Location', message: 'Error creating event location: 500' }
    ],
    updated: [
      { id: 'update-event-location-success', title: 'Update Event Location', message: 'Event location updated successfully.' }
    ],
    notUpdated: [
      { id: 'update-event-location-error', title: 'Update Event Location', message: 'Error updating event location: 500' }
    ],
    deleted: [
      { id: 'delete-event-location-success', title: 'Delete Event Location', message: 'Event location deleted successfully.' }
    ],
    notDeleted: [
      { id: 'delete-event-location-error', title: 'Delete Event Location', message: 'Error deleting event location: 500' }
    ]
  },
  organization: {
    created: [{ id: 'org-create-success', title: 'Create organization', message: 'Organization was successfully created.' }],
    notCreated: [{ id: 'org-create-failed', title: 'Create organization', message: 'Error creating organization: 500' }],
    updated: [{ id: 'org-update-success', title: 'Update organization', message: 'Organization was successfully updated.' }],
    notUpdated: [{ id: 'org-update-failed', title: 'Update organization', message: 'Error updating organization: 500' }],
    deleted: [{ id: 'org-delete-success', title: 'Delete organization', message: 'Organization was successfully deleted.' }],
    notDeleted: [{ id: 'org-delete-failed', title: 'Delete organization', message: 'Error deleting organization: 500' }]
  },
  class: {
    created: [{ id: 'class-create-success', title: 'Create class', message: 'Class was successfully created.' }],
    notCreated: [{ id: 'class-create-failed', title: 'Create class', message: 'Error creating class: 500' }],
    updated: [{ id: 'class-update-success', title: 'Update class', message: 'Class was successfully updated.' }],
    notUpdated: [{ id: 'class-update-failed', title: 'Update class', message: 'Error updating class: 500' }],
    deleted: [{ id: 'class-delete-success', title: 'Delete class', message: 'Class was successfully deleted.' }],
    notDeleted: [{ id: 'class-delete-failed', title: 'Delete class', message: 'Error deleting class: 500' }]
  }
};
