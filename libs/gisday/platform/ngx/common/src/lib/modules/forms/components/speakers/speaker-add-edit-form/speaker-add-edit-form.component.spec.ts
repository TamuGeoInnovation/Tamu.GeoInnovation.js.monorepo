import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  AssetsService,
  OrganizationService,
  SeasonService,
  SpeakerService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SpeakerAddEditFormComponent } from './speaker-add-edit-form.component';

describe('SpeakerAddEditFormComponent', () => {
  // The admin form showed a speaker's photo without the university banner the public pages draw on it,
  // so an admin could not see what a change to the university or the year would look like (#1757).
  describe('the banner on the photograph', () => {
    const universities = [
      { guid: 'tamu', name: 'Texas A&M University', acronym: 'TAMU', hexTriplet: '500000' },
      { guid: 'lsu', name: 'Louisiana State University', acronym: 'LSU', hexTriplet: '461d7c' }
    ];

    function create() {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: SpeakerService, useValue: { getEntity: () => of({}) } },
          { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
          { provide: UniversityService, useValue: { getEntitiesForActiveSeason: () => of(universities) } },
          { provide: OrganizationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: () => undefined } }
        ]
      });

      const fixture = TestBed.createComponent(SpeakerAddEditFormComponent);
      fixture.componentRef.setInput('type', 'create');
      fixture.detectChanges();

      const banner = () => (fixture.nativeElement as HTMLElement).querySelector('.speaker-photo .class-banner')?.textContent?.trim() ?? null;
      const set = (value: object) => {
        fixture.componentInstance.form.patchValue(value);
        fixture.detectChanges();
      };

      return { banner, set };
    }

    it('shows the university and class year chosen in the form', () => {
      const { banner, set } = create();

      set({ university: 'tamu', graduationYear: '2024' });

      expect(banner()).toBe("TAMU '24");
    });

    it('changes as the university and the year are changed', () => {
      const { banner, set } = create();

      set({ university: 'tamu', graduationYear: '2024' });
      set({ university: 'lsu', graduationYear: '2022' });

      expect(banner()).toBe("LSU '22");
    });

    it('goes when the university is cleared', () => {
      const { banner, set } = create();

      set({ university: 'tamu', graduationYear: '2024' });
      set({ university: null });

      expect(banner()).toBeNull();
    });
  });
});
