import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

import { BroadcastService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BroadcastAddEditFormComponent } from './broadcast-add-edit-form.component';

/**
 * #3048. A broadcast belongs to an organization (a place), set on its admin page as a venue's is (#443), so each site can
 * list only its own organizations' broadcasts.
 */
describe('BroadcastAddEditFormComponent', () => {
  const places = [
    { guid: 'tamu', name: 'Texas A&M University GIS Day(s)' },
    { guid: 'ttu', name: 'Texas Tech University GIS Day' }
  ];

  function create(type: 'create' | 'edit', broadcast?: Subject<object>) {
    const service = {
      getEntity: () => broadcast,
      createEntity: vi.fn(() => of({})),
      updateEntity: vi.fn(() => of({}))
    };
    const toast = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'zoom' }) } },
        { provide: BroadcastService, useValue: service },
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of(places) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast } }
      ]
    });

    const fixture = TestBed.createComponent(BroadcastAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return { fixture, service, toast, page: fixture.nativeElement as HTMLElement };
  }

  it('asks for the organization first, as a venue does', () => {
    const { page } = create('create');

    expect(page.querySelector('[formcontrolname]').getAttribute('formcontrolname')).toBe('place');
  });

  it('saves a new broadcast with its organization', () => {
    const { fixture, service } = create('create');

    fixture.componentInstance.form.patchValue({ name: 'TAMU Zoom 1', place: 'tamu' });
    fixture.componentInstance.handleSubmission();

    expect(service.createEntity).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'TAMU Zoom 1', place: 'tamu', season: 'season' })
    );
  });

  it("shows a broadcast's organization when it opens, unchanged, and saves a new one", () => {
    const broadcast = new Subject<object>();
    const { fixture, service } = create('edit', broadcast);

    // After the page has drawn, as an answer from the API arrives.
    broadcast.next({ guid: 'zoom', name: 'TAMU Zoom 1', place: { guid: 'tamu', name: places[0].name } });
    broadcast.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue().place).toBe('tamu');
    expect(fixture.componentInstance.form.dirty).toBe(false);

    fixture.componentInstance.form.patchValue({ place: 'ttu' });
    fixture.componentInstance.handleSubmission();

    expect(service.updateEntity).toHaveBeenCalledWith('zoom', expect.objectContaining({ place: 'ttu' }));
  });

  it('refuses to save a broadcast with no organization, and says why', () => {
    const { fixture, service, toast } = create('create');

    fixture.componentInstance.form.patchValue({ name: 'A Zoom', place: null });
    fixture.componentInstance.handleSubmission();

    expect(service.createEntity).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ id: 'broadcast-place-error' }));
  });
});
