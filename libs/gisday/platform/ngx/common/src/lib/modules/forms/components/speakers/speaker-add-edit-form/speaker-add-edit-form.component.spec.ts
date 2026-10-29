import { provideHttpClient } from '@angular/common/http';
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
  // A new speaker has no photograph, and the form drew an image with no source: a broken image and its alt text (#2422).
  describe('the photograph preview', () => {
    function create() {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          provideHttpClient(),
          { provide: SpeakerService, useValue: { getEntity: () => of({}) } },
          { provide: AssetsService, useValue: { getAssetUrl: (path: string) => of(`assets/uploads/${path}`) } },
          { provide: UniversityService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
          { provide: OrganizationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: () => undefined } }
        ]
      });

      const fixture = TestBed.createComponent(SpeakerAddEditFormComponent);
      fixture.componentRef.setInput('type', 'create');
      fixture.detectChanges();

      const images = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('.speaker-photo img'));
      const icon = () =>
        (fixture.nativeElement as HTMLElement).querySelector('.speaker-photo .material-icons')?.textContent.trim();
      const choose = (file: File | null) => {
        fixture.componentInstance.form.get('file').setValue(file);
        fixture.detectChanges();
      };

      return { images, icon, choose };
    }

    beforeEach(() => {
      URL.createObjectURL = jest.fn(() => 'blob:chosen-photo');
    });

    it('draws no image without a source before a photograph is chosen', () => {
      const { images } = create();

      expect(images().filter((img) => !img.getAttribute('src'))).toEqual([]);
    });

    /**
     * The first fix showed `images/placeholder.svg` from the uploads folder. That file ships in the site image, but
     * production mounts its uploads volume over that folder, so the file answered 404 there and the broken image
     * stayed (28 October 2026). Before a photograph is chosen, the preview is now the person icon the shared speaker
     * avatar draws for a speaker with no photo: no file at all, so nothing can be missing.
     */
    it('shows the person icon, and asks for no picture file, before a photograph is chosen', () => {
      const { images, icon } = create();

      expect(images()).toEqual([]);
      expect(icon()).toBe('person');
    });

    it('shows the chosen photograph in place of the icon', () => {
      const { images, icon, choose } = create();

      choose(new File(['x'], 'speaker.png', { type: 'image/png' }));

      expect(images().map((img) => img.getAttribute('src'))).toEqual(['blob:chosen-photo']);
      expect(icon()).toBeUndefined();
    });

    it('brings the icon back on Undo', () => {
      const { images, icon, choose } = create();

      choose(new File(['x'], 'speaker.png', { type: 'image/png' }));
      choose(null);

      expect(images()).toEqual([]);
      expect(icon()).toBe('person');
    });
  });

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
          provideHttpClient(),
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
