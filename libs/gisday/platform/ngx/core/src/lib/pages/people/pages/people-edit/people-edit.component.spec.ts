import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

import {
  SessionFilesService,
  SpeakerEditPage,
  SpeakerEditsService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
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
        { provide: UniversityService, useValue: { getEntitiesForActiveSeason: () => of(universities) } },
        { provide: SessionFilesService, useValue: { forLink: () => of([]) } }
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
});

/**
 * #3093. Under the profile, the speaker's link lists each session they present this season, with its slides: upload,
 * what is uploaded now, replace and remove, all through the link, with no account.
 */
describe('PeopleEditComponent, Your sessions (#3093)', () => {
  // Invented sessions; nobody real.
  const watersheds = {
    guid: 's-1',
    name: 'Mapping Example Watersheds',
    date: '2026-11-18T06:00:00.000Z',
    startTime: '09:30:00 GMT-0600 (Central Standard Time)',
    endTime: '10:15:00 GMT-0600 (Central Standard Time)',
    place: 'Example Hall 101',
    file: { guid: 'f-1', name: 'watersheds.pdf', size: 2_200_000, uploaded: '2026-11-15T18:00:00.000Z' }
  };
  const lightning = { ...watersheds, guid: 's-2', name: 'Lightning Talks', place: null, file: null };

  let files: { forLink: jest.Mock; upload: jest.Mock; remove: jest.Mock };

  async function open(sessions: Array<object> | 'fails' = [watersheds, lightning]) {
    files = {
      forLink: jest.fn(() => (sessions === 'fails' ? throwError(() => new Error('down')) : of(sessions))),
      upload: jest.fn(),
      remove: jest.fn(() => of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [PeopleEditComponent],
      providers: [
        provideRouter([]),
        { provide: EnvironmentService, useValue: { value: () => '' } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ token: 'a-link' })) } },
        { provide: SpeakerEditsService, useValue: { forLink: () => of(editPage(null)) } },
        { provide: UniversityService, useValue: { getEntitiesForActiveSeason: () => of(universities) } },
        { provide: SessionFilesService, useValue: files }
      ]
    });

    const fixture = TestBed.createComponent(PeopleEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const sessionBlocks = () =>
      [...root.querySelectorAll('tamu-gisc-submission-files')].map((f) => f.parentElement as HTMLElement);

    return { fixture, root, sessionBlocks };
  }

  it("lists the speaker's sessions by the link, with when and where", async () => {
    const { root, sessionBlocks } = await open();

    expect(files.forLink).toHaveBeenCalledWith('a-link');
    expect(root.textContent).toContain('Your sessions');
    expect(sessionBlocks()).toHaveLength(2);
    expect(sessionBlocks()[0].textContent).toContain('Mapping Example Watersheds');
    expect(sessionBlocks()[0].textContent.replace(/\s+/g, ' ')).toContain(
      'Wednesday, November 18 · 9:30 AM–10:15 AM · Example Hall 101'
    );
  });

  it('shows what is uploaded now, with Replace and Remove, and offers an upload where there is none', async () => {
    const { sessionBlocks } = await open();
    const [first, second] = sessionBlocks();

    expect(first.querySelector('.file-name').textContent.trim()).toBe('watersheds.pdf');
    expect(first.querySelector('.file-detail').textContent).toContain('2.1 MB');
    expect(first.querySelector('tamu-gisc-file').textContent).toContain('Replace');
    expect(first.textContent).toContain('Remove');
    // Seen by the GIS Day team only: no download for the speaker.
    expect(first.querySelector('button.file-name')).toBeNull();

    expect(second.querySelector('.files-empty').textContent.trim()).toBe('No slides uploaded yet.');
    expect(second.querySelector('tamu-gisc-file').textContent).toContain('Upload slides');
  });

  it('uploads, replaces and removes through the link, for that session', async () => {
    const { fixture, sessionBlocks } = await open();
    const lists = fixture.debugElement.queryAll((d) => d.name === 'tamu-gisc-submission-files');
    const [watersheds, lightningTalks] = lists.map((d) => d.componentInstance);
    files.upload.mockReturnValue(
      of({
        type: HttpEventType.Response,
        body: { guid: 'f-2', name: 'talk.pptx', size: 10, uploaded: '2026-11-15T19:00:00Z' }
      })
    );

    lightningTalks.upload(new File(['x'], 'talk.pptx'));
    watersheds.remove(watersheds.files()[0]);
    fixture.detectChanges();

    expect(files.upload).toHaveBeenCalledWith('a-link', 's-2', expect.any(File));
    expect(files.remove).toHaveBeenCalledWith('a-link', 's-1');
    expect(sessionBlocks()[1].querySelector('.file-name').textContent.trim()).toBe('talk.pptx');
    expect(sessionBlocks()[0].querySelector('.files-empty')).not.toBeNull();
  });

  it('shows no sessions section to a speaker with none, or when they cannot be listed', async () => {
    expect((await open([])).root.textContent).not.toContain('Your sessions');
    TestBed.resetTestingModule();
    const failed = await open('fails');

    expect(failed.root.textContent).not.toContain('Your sessions');
    expect(failed.root.textContent).toContain('Avery Example');
  });
});
