import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SpeakerEditPage, SpeakerEditsService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { PeopleEditComponent } from './people-edit.component';

// Invented universities and an invented speaker; nobody real.
const universities = [
  { guid: 'u-1', name: 'Example State University', acronym: 'ESU', hexTriplet: '500000' },
  { guid: 'u-2', name: 'Sample Tech', acronym: 'STECH', hexTriplet: '0039a6' }
];

function editPage(photo: string | null): SpeakerEditPage {
  return {
    firstName: 'Avery',
    lastName: 'Example',
    current: {
      description: 'Maps things.',
      affiliation: 'Example Agency',
      socialMedia: '',
      graduationYear: '2002',
      university: { guid: 'u-1', name: 'Example State University' }
    },
    organization: null,
    photo,
    pending: null,
    expires: '2026-11-21T12:00:00Z',
    limits: { description: 1500, affiliation: 200, socialMedia: 500 }
  };
}

// #2956: the speaker's own page shows their photo as the admin speaker form does, full size through the shared
// image preview, with the school banner and class year following what they choose on the page.
describe('PeopleEditComponent photo (#2956)', () => {
  async function open(photo: string | null = 'images/speakers/avery.jpg') {
    TestBed.configureTestingModule({
      imports: [PeopleEditComponent],
      providers: [
        provideRouter([]),
        { provide: EnvironmentService, useValue: { value: () => '' } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ token: 'a-link' })) } },
        { provide: SpeakerEditsService, useValue: { forLink: () => of(editPage(photo)) } },
        { provide: UniversityService, useValue: { getEntitiesForActiveSeason: () => of(universities) } }
      ]
    });

    const fixture = TestBed.createComponent(PeopleEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const preview = () => root.querySelector('tamu-gisc-image-preview');
    const banner = () => root.querySelector('tamu-gisc-speaker-class-banner .class-banner') as HTMLElement | null;

    return { fixture, root, preview, banner };
  }

  it('shows the current photo through the shared image preview', async () => {
    const { preview } = await open();

    expect(preview()).not.toBeNull();
    expect(preview()?.querySelector('img')?.getAttribute('src')).toBe('assets/uploads/images/speakers/avery.jpg');
  });

  it('shows a chosen photo in the same preview', async () => {
    const { fixture, preview } = await open();
    const created = jest.fn(() => 'blob:chosen');
    Object.assign(URL, { createObjectURL: created, revokeObjectURL: jest.fn() });

    fixture.componentInstance.choosePhoto(new File(['x'], 'me.png', { type: 'image/png' }));
    fixture.detectChanges();

    expect(preview()?.querySelector('img')?.getAttribute('src')).toBe('blob:chosen');
  });

  it('draws the school banner and class year from the profile', async () => {
    const { banner } = await open();

    expect(banner()?.textContent?.trim()).toBe("ESU '02");
    expect(banner()?.style.background).toBe('rgb(80, 0, 0)');
  });

  it('follows the University and Graduation year chosen on the page', async () => {
    const { fixture, banner } = await open();

    fixture.componentInstance.form.patchValue({ university: 'u-2', graduationYear: '2018' });
    fixture.detectChanges();

    expect(banner()?.textContent?.trim()).toBe("STECH '18");
    expect(banner()?.style.background).toBe('rgb(0, 57, 166)');

    fixture.componentInstance.form.patchValue({ university: '' });
    fixture.detectChanges();

    expect(banner()).toBeNull();
  });

  it('shows the person icon, and no banner, when there is no photo', async () => {
    const { preview, banner } = await open(null);

    expect(preview()?.querySelector('img')).toBeNull();
    expect(preview()?.querySelector('.material-icons')?.textContent?.trim()).toBe('person');
    expect(banner()).toBeNull();
  });

  /**
   * #3074. The presenter's own page reads the shared upload rule (#2937, #3009), as the admin forms do, and refuses in
   * the API's words; it had its own check and its own wording.
   */
  describe('choosing a photo', () => {
    const alert = (root: HTMLElement) => root.querySelector('[role="alert"]')?.textContent?.trim();

    it("refuses an SVG in the API's words, and keeps no photo", async () => {
      const { fixture, root } = await open();

      fixture.componentInstance.choosePhoto(new File(['<svg/>'], 'me.svg', { type: 'image/svg+xml' }));
      fixture.detectChanges();

      expect(alert(root)).toBe('The photo must be a JPEG or PNG image.');
      expect(fixture.componentInstance.photo()).toBeNull();
    });

    it('refuses a photo over 5 MB, and keeps no photo', async () => {
      const { fixture, root } = await open();
      const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'me.png', { type: 'image/png' });

      fixture.componentInstance.choosePhoto(big);
      fixture.detectChanges();

      expect(alert(root)).toBe('The photo must be 5 MB or smaller.');
      expect(fixture.componentInstance.photo()).toBeNull();
    });
  });
});
