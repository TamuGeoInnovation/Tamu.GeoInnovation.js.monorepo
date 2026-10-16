import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LocationService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventLocationAddEditFormComponent } from './event-location-add-edit-form.component';

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
        fixture.componentInstance.form.patchValue({ building: 'TAMU Rudder Plaza', checkInZoneText });
        fixture.componentInstance.handleSubmission();
      };

      return { save, createEntity, toast };
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
  });
});
