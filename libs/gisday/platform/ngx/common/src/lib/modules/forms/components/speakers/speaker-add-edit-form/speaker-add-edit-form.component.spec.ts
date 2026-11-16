import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

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

      const choosePhoto = () => set({ file: new File(['x'], 'speaker.png', { type: 'image/png' }) });

      return { banner, set, choosePhoto };
    }

    beforeEach(() => {
      URL.createObjectURL = jest.fn(() => 'blob:chosen-photo');
    });

    it('shows the university and class year chosen in the form', () => {
      const { banner, set, choosePhoto } = create();

      choosePhoto();
      set({ university: 'tamu', graduationYear: '2024' });

      expect(banner()).toBe("TAMU '24");
    });

    it('changes as the university and the year are changed', () => {
      const { banner, set, choosePhoto } = create();

      choosePhoto();
      set({ university: 'tamu', graduationYear: '2024' });
      set({ university: 'lsu', graduationYear: '2022' });

      expect(banner()).toBe("LSU '22");
    });

    it('goes when the university is cleared', () => {
      const { banner, set, choosePhoto } = create();

      choosePhoto();
      set({ university: 'tamu', graduationYear: '2024' });
      set({ university: null });

      expect(banner()).toBeNull();
    });

    // #2568: a speaker with a school and a year but no photo got the banner drawn over the blank person icon.
    it('is not drawn over the person icon when there is no photo (#2568)', () => {
      const { banner, set } = create();

      set({ university: 'tamu', graduationYear: '2013' });

      expect(banner()).toBeNull();
    });

    it('goes with the photo on Undo (#2568)', () => {
      const { banner, set, choosePhoto } = create();

      choosePhoto();
      set({ university: 'tamu', graduationYear: '2013' });
      set({ file: null });

      expect(banner()).toBeNull();
    });
  });

  async function openForImage(): Promise<ComponentFixture<SpeakerAddEditFormComponent>> {
    URL.createObjectURL = jest.fn(() => 'blob:chosen-photo');
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

    return fixture;
  }

  /**
   * #3074. The picker reads the shared upload rule (#2937, #3009), as the sponsor form's does: it offers only JPEG and
   * PNG up to 5 MB, and refuses anything else as soon as it is chosen, in the API's words, keeping no file.
   */
  describe('choosing an image', () => {
    // jsdom cannot put a file in a file input, so the picker is given the input's change, as the browser gives it.
    const choose = (fixture: ComponentFixture<{ form: { getRawValue(): { file?: unknown } } }>, file: File) => {
      fixture.debugElement
        .query(By.directive(FileComponent))
        .componentInstance.handleFileChange({ target: { files: [file], value: file.name } });
      fixture.detectChanges();
    };
    const alert = (fixture: ComponentFixture<unknown>) =>
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent?.trim();
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'image.svg', { type: 'image/svg+xml' });

    it("refuses an SVG as soon as it is chosen, in the API's words, and keeps no file", async () => {
      const fixture = await openForImage();

      choose(fixture, svg);

      expect(alert(fixture)).toBe('The photo must be a JPEG or PNG image.');
      expect(fixture.componentInstance.form.getRawValue().file).toBeFalsy();
    });

    it('refuses an image over 5 MB as soon as it is chosen', async () => {
      const fixture = await openForImage();

      choose(fixture, new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }));

      expect(alert(fixture)).toBe('The photo must be 5 MB or smaller.');
      expect(fixture.componentInstance.form.getRawValue().file).toBeFalsy();
    });

    it('takes a PNG, and clears the refusal', async () => {
      const fixture = await openForImage();
      const png = new File(['png'], 'image.png', { type: 'image/png' });

      choose(fixture, svg);
      choose(fixture, png);

      expect(alert(fixture)).toBeUndefined();
      expect(fixture.componentInstance.form.getRawValue().file).toBe(png);
    });
  });
});
