import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

import { LocationService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventLocationAddEditFormComponent } from './event-location-add-edit-form.component';

// The zone's map is Esri's, which jsdom cannot draw. It is stood in for by a component with the same selector,
// inputs and output, so what is asked here is what the form gives the map and what it does with the map's answer.
jest.mock('@tamu-gisc/maps/esri', () => {
  const { Component, EventEmitter, Input, Output } = jest.requireActual('@angular/core');

  @Component({ selector: 'tamu-gisc-polygon-editor', template: '' })
  class PolygonEditorComponent {
    @Input() public corners = [];
    @Input() public center: unknown;
    @Output() public cornersChange = new EventEmitter();
  }

  return { PolygonEditorComponent };
});

interface ZoneMap {
  corners: Array<{ latitude: number; longitude: number }>;
  cornersChange: { emit(corners: Array<{ latitude: number; longitude: number }>): void };
}

describe('EventLocationAddEditFormComponent', () => {
  // A venue's check-in zone, typed one corner per line (#1766). A zone that cannot be used must not
  // be saved: it would refuse every check-in at the venue, or let in people who are not there.
  describe('the check-in zone', () => {
    const sw = '30.612, -96.342';
    const nw = '30.613, -96.342';
    const ne = '30.613, -96.341';
    const se = '30.612, -96.341';

    function create() {
      const createEntity = jest.fn().mockReturnValue(of({}));
      const toast = jest.fn();

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: LocationService, useValue: { createEntity } },
          { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast } }
        ]
      });

      const fixture = TestBed.createComponent(EventLocationAddEditFormComponent);
      fixture.componentRef.setInput('type', 'create');
      fixture.detectChanges();

      const save = (checkInZoneText: string) => {
        fixture.componentInstance.form.patchValue({ building: 'TAMU Rudder Plaza', place: 'place', checkInZoneText });
        fixture.componentInstance.handleSubmission();
      };

      return { save, createEntity, toast, fixture };
    }

    it('saves corners typed in order around the zone', () => {
      const { save, createEntity } = create();

      save([sw, nw, ne, se].join('\n'));

      expect(createEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          checkInZone: [
            { latitude: 30.612, longitude: -96.342 },
            { latitude: 30.613, longitude: -96.342 },
            { latitude: 30.613, longitude: -96.341 },
            { latitude: 30.612, longitude: -96.341 }
          ]
        })
      );
    });

    it('saves no zone when none is typed', () => {
      const { save, createEntity } = create();

      save('');

      expect(createEntity).toHaveBeenCalledWith(expect.objectContaining({ checkInZone: null }));
    });

    it.each([
      ['corners out of order, so the sides cross', [sw, ne, nw, se].join('\n')],
      ['fewer than three corners', [sw, nw].join('\n')],
      ['a line that is not a latitude and longitude', [sw, nw, 'Rudder Plaza'].join('\n')],
      ['a latitude out of range', [sw, nw, '130.613, -96.341'].join('\n')]
    ])('refuses to save %s, and says why', (_, text) => {
      const { save, createEntity, toast } = create();

      save(text);

      expect(createEntity).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-location-check-in-zone-error' }));
    });

    // #443: venues were saved with no hosting organization, and every session held at them was then missing from
    // the public Sessions page.
    it('refuses to save a venue with no hosting organization, and says why', () => {
      const { fixture, createEntity, toast } = create();

      fixture.componentInstance.form.patchValue({ building: 'TAMU Rudder Plaza', place: null, checkInZoneText: '' });
      fixture.componentInstance.handleSubmission();

      expect(createEntity).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-location-place-error' }));
    });

    it('asks for the hosting organization first, before the venue name', () => {
      const { fixture } = create();
      const page = fixture.nativeElement as HTMLElement;
      const first = page.querySelector('[formcontrolname]');

      expect(first.getAttribute('formcontrolname')).toBe('place');
    });
  });

  /**
   * #2942. Escape on an admin details page asks before leaving only when the form has changes. A venue opened and left
   * as it was has none: its controls take the values the page gives them without reporting them back (#2964).
   */
  describe('as it opens', () => {
    it('holds no changes once the venue it shows has arrived', () => {
      const venue = new Subject<object>();

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of({ guid: 'venue' }) } },
          { provide: LocationService, useValue: { getEntity: () => venue } },
          {
            provide: PlaceService,
            useValue: { getEntitiesForActiveSeason: () => of([{ guid: 'place', name: 'Texas A&M University' }]) }
          },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: jest.fn() } }
        ]
      });

      const fixture = TestBed.createComponent(EventLocationAddEditFormComponent);
      fixture.componentRef.setInput('type', 'edit');
      fixture.detectChanges();

      // After the page has drawn, as an answer from the API arrives.
      venue.next({ guid: 'venue', building: 'Rudder Tower', room: '301', place: { guid: 'place' } });
      venue.complete();
      fixture.detectChanges();

      expect(fixture.componentInstance.form.getRawValue().place).toBe('place');
      expect(fixture.componentInstance.form.dirty).toBe(false);
    });
  });

  /**
   * #3078. The zone is drawn and seen on a map beside the typed corners. Both edit the same value: the corners as
   * typed, one `latitude, longitude` per line, which is what is saved.
   */
  describe('the check-in zone map', () => {
    const rudderPlaza = [
      { latitude: 30.612, longitude: -96.342 },
      { latitude: 30.613, longitude: -96.342 },
      { latitude: 30.613, longitude: -96.341 },
      { latitude: 30.612, longitude: -96.341 }
    ];

    const typed = ['30.612, -96.342', '30.613, -96.342', '30.613, -96.341', '30.612, -96.341'].join('\n');

    async function open(venue: object) {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of({ guid: 'venue' }) } },
          { provide: LocationService, useValue: { getEntity: () => of(venue) } },
          { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: jest.fn() } }
        ]
      });

      const fixture = TestBed.createComponent(EventLocationAddEditFormComponent);
      fixture.componentRef.setInput('type', 'edit');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const zoneMap = (): ZoneMap => {
        const element = (fixture.nativeElement as HTMLElement).querySelector('tamu-gisc-polygon-editor');

        if (!element) {
          throw new Error('The form has no zone map.');
        }

        return fixture.debugElement.query((d) => d.nativeElement === element).componentInstance;
      };

      const text = () => fixture.componentInstance.form.getRawValue().checkInZoneText;

      return { fixture, zoneMap, text };
    }

    it("shows a venue's corners on the map as the form opens", async () => {
      const { zoneMap } = await open({ guid: 'venue', place: { guid: 'place' }, checkInZone: rudderPlaza });

      expect(zoneMap().corners).toEqual(rudderPlaza);
    });

    it('shows corners typed into the box on the map', async () => {
      const { fixture, zoneMap } = await open({ guid: 'venue', place: { guid: 'place' }, checkInZone: null });

      expect(zoneMap().corners).toEqual([]);

      fixture.componentInstance.form.controls.checkInZoneText.setValue(typed);
      fixture.detectChanges();

      expect(zoneMap().corners).toEqual(rudderPlaza);
    });

    it('keeps the last readable zone on the map while a line is half typed', async () => {
      const { fixture, zoneMap } = await open({ guid: 'venue', place: { guid: 'place' }, checkInZone: rudderPlaza });

      fixture.componentInstance.form.controls.checkInZoneText.setValue(`${typed}\n30.61`);
      fixture.detectChanges();

      expect(zoneMap().corners).toEqual(rudderPlaza);
    });

    it('writes corners drawn or moved on the map into the box, one per line, as typed corners are', async () => {
      const { fixture, zoneMap, text } = await open({ guid: 'venue', place: { guid: 'place' }, checkInZone: null });

      zoneMap().cornersChange.emit(rudderPlaza);
      fixture.detectChanges();

      expect(text()).toBe(typed);
      // So Escape asks before leaving a zone drawn and not saved (#2942).
      expect(fixture.componentInstance.form.dirty).toBe(true);
    });

    it('empties the box when the zone is cleared on the map', async () => {
      const { fixture, zoneMap, text } = await open({ guid: 'venue', place: { guid: 'place' }, checkInZone: rudderPlaza });

      expect(text()).toBe(typed);

      zoneMap().cornersChange.emit([]);
      fixture.detectChanges();

      expect(text()).toBe('');
      expect(zoneMap().corners).toEqual([]);
    });
  });
});
