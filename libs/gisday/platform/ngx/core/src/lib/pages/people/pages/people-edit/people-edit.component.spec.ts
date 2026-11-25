import type { Mock } from 'vitest';
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
    const created = vi.fn(() => 'blob:chosen');
    Object.assign(URL, { createObjectURL: created, revokeObjectURL: vi.fn() });

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

/**
 * #3093. Under the profile, the speaker's link lists each session they present this season, with their own slides for
 * it: up to three files, each with its own Remove, uploaded and removed through the link, with no account.
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
    files: [{ guid: 'f-1', name: 'watersheds.pdf', size: 2_200_000, uploaded: '2026-11-15T18:00:00.000Z' }]
  };
  const lightning = { ...watersheds, guid: 's-2', name: 'Lightning Talks', place: null, files: [] };

  let files: { forLink: Mock; upload: Mock; remove: Mock };

  async function open(sessions: Array<object> | 'fails' = [watersheds, lightning]) {
    files = {
      forLink: vi.fn(() => (sessions === 'fails' ? throwError(() => new Error('down')) : of(sessions))),
      upload: vi.fn(),
      remove: vi.fn(() => of(undefined))
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

  it('shows what the speaker has uploaded, each with Remove, an upload beside them, and an upload where there is none', async () => {
    const { sessionBlocks } = await open();
    const [first, second] = sessionBlocks();

    expect(first.querySelector('.file-name').textContent.trim()).toBe('watersheds.pdf');
    expect(first.querySelector('.file-detail').textContent).toContain('2.1 MB');
    expect(first.querySelector('tamu-gisc-file').textContent).toContain('Upload slides');
    expect(first.querySelector('.files-limits').textContent).toContain('up to 3 files');
    expect(first.textContent).toContain('Remove');
    // Seen by the GIS Day team and the speaker who uploaded them: no download for the speaker.
    expect(first.querySelector('button.file-name')).toBeNull();

    expect(second.querySelector('.files-empty').textContent.trim()).toBe('No slides uploaded yet.');
    expect(second.querySelector('tamu-gisc-file').textContent).toContain('Upload slides');
  });

  // #3147: a session with no slides offers no upload, and says why.
  it('offers no upload for a session with no slides, and says none are needed', async () => {
    const panel = { ...lightning, guid: 's-3', name: 'A Made-up Panel', noSlides: true };
    const { root, sessionBlocks } = await open([watersheds, panel]);

    expect(sessionBlocks()).toHaveLength(1);
    expect(sessionBlocks()[0].textContent).toContain('Mapping Example Watersheds');

    const blocks = [...root.querySelectorAll('.form-collection.column')] as Array<HTMLElement>;
    const panelBlock = blocks.find((b) => b.textContent.includes('A Made-up Panel'));

    expect(panelBlock.querySelector('tamu-gisc-file')).toBeNull();
    expect(panelBlock.textContent).toContain('No slides are needed for this session.');
  });

  it('holds up to three files a session, each with its own Remove, and offers no fourth', async () => {
    const three = ['deck.pptx', 'deck.pdf', 'handout.pdf'].map((name, n) => ({
      guid: `f-${n}`,
      name,
      size: 1024,
      uploaded: '2026-11-15T18:00:00.000Z'
    }));
    const { sessionBlocks } = await open([{ ...watersheds, files: three }]);
    const [block] = sessionBlocks();

    expect([...block.querySelectorAll('.file-name')].map((e) => e.textContent.trim())).toEqual([
      'deck.pptx',
      'deck.pdf',
      'handout.pdf'
    ]);
    expect([...block.querySelectorAll('button.danger')].map((e) => e.textContent.trim())).toEqual([
      'Remove',
      'Remove',
      'Remove'
    ]);
    expect(block.querySelector('tamu-gisc-file')).toBeNull();
  });

  it('refuses a fourth file before sending it, with the reason', async () => {
    const three = [1, 2, 3].map((n) => ({ guid: `f-${n}`, name: `${n}.pdf`, size: 10, uploaded: '2026-11-15T18:00:00Z' }));
    const { fixture, sessionBlocks } = await open([{ ...watersheds, files: three }]);
    const [list] = fixture.debugElement.queryAll((d) => d.name === 'tamu-gisc-submission-files');

    list.componentInstance.upload(new File(['x'], 'extra.pdf'));
    fixture.detectChanges();

    expect(files.upload).not.toHaveBeenCalled();
    expect(sessionBlocks()[0].querySelector('[role=alert]').textContent).toBe(
      'You can upload up to 3 files for each session. Remove one before adding another.'
    );
  });

  it('adds an upload beside the files there, and removes one file by its id, through the link', async () => {
    const { fixture, sessionBlocks } = await open();
    const lists = fixture.debugElement.queryAll((d) => d.name === 'tamu-gisc-submission-files');
    const [watersheds] = lists.map((d) => d.componentInstance);
    files.upload.mockReturnValue(
      of({
        type: HttpEventType.Response,
        body: { guid: 'f-2', name: 'talk.pptx', size: 10, uploaded: '2026-11-15T19:00:00Z' }
      })
    );

    watersheds.upload(new File(['x'], 'talk.pptx'));
    fixture.detectChanges();

    expect(files.upload).toHaveBeenCalledWith('a-link', 's-1', expect.any(File));
    expect([...sessionBlocks()[0].querySelectorAll('.file-name')].map((e) => e.textContent.trim())).toEqual([
      'watersheds.pdf',
      'talk.pptx'
    ]);

    watersheds.remove(watersheds.files()[0]);
    fixture.detectChanges();

    expect(files.remove).toHaveBeenCalledWith('a-link', 's-1', 'f-1');
    expect([...sessionBlocks()[0].querySelectorAll('.file-name')].map((e) => e.textContent.trim())).toEqual(['talk.pptx']);
  });

  it('uploads and removes through the link, for that session', async () => {
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
    expect(files.remove).toHaveBeenCalledWith('a-link', 's-1', 'f-1');
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
