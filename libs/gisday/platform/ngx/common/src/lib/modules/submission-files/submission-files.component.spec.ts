import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { downloadFile } from '@tamu-gisc/common/utils/ui';

import { SubmissionFilesComponent } from './submission-files.component';

vi.mock('@tamu-gisc/common/utils/ui', async (original) => ({
  ...(await original<object>()),
  downloadFile: vi.fn()
}));

/** The files a student attaches to their submission, and an admin downloads (#2933). */
describe('SubmissionFilesComponent', () => {
  const GUID = '11111111-2222-4333-8444-555555555555';
  const deck = { guid: 'f1', name: 'Texas Watersheds.pptx', size: 4_400_000, uploaded: '2026-11-14T18:00:00.000Z' };

  let service: { getFiles: Mock; addFile: Mock; deleteFile: Mock; getFileContents: Mock };

  function render(editable: boolean, files = [deck]) {
    service.getFiles.mockReturnValue(of(files));
    TestBed.configureTestingModule({ providers: [{ provide: UserSubmissionsService, useValue: service }] });

    const fixture = TestBed.createComponent(SubmissionFilesComponent);
    fixture.componentRef.setInput('submissionGuid', GUID);
    fixture.componentRef.setInput('editable', editable);
    fixture.detectChanges();

    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => {
    service = { getFiles: vi.fn(), addFile: vi.fn(), deleteFile: vi.fn(), getFileContents: vi.fn() };
  });

  /** #3611. Given neither a source nor a submission, the list has no files to ask for, rather than asking for "undefined"'s. */
  it('asks for no files when it is given neither a source nor a submission', () => {
    TestBed.configureTestingModule({ providers: [{ provide: UserSubmissionsService, useValue: service }] });

    const fixture = TestBed.createComponent(SubmissionFilesComponent);
    fixture.detectChanges();

    expect(service.getFiles).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No files attached yet.');
  });

  it("lists the submission's files with their sizes, and offers no picker or Remove to an admin reviewing it", () => {
    const { element } = render(false);

    expect(element.querySelector('.file-name').textContent.trim()).toBe('Texas Watersheds.pptx');
    expect(element.querySelector('.file-detail').textContent).toContain('4.2 MB');
    expect(element.querySelector('tamu-gisc-file')).toBeNull();
    expect(element.textContent).not.toContain('Remove');
  });

  it('refuses a file that is not PowerPoint or PDF before sending it, and says why', () => {
    const { fixture, element } = render(true);

    fixture.componentInstance.upload(new File(['x'], 'notes.docx'));
    fixture.detectChanges();

    expect(service.addFile).not.toHaveBeenCalled();
    expect(element.querySelector('[role=alert]').textContent).toContain('notes.docx is not a PowerPoint or PDF file');
  });

  it('uploads a chosen file and lists it once the API has it', () => {
    const { fixture, element } = render(true, []);
    const poster = { guid: 'f2', name: 'poster.pdf', size: 1, uploaded: '2026-11-14T18:05:00.000Z' };
    service.addFile.mockReturnValue(
      of({ type: HttpEventType.UploadProgress, loaded: 1, total: 2 }, { type: HttpEventType.Response, body: poster })
    );

    fixture.componentInstance.upload(new File(['x'], 'poster.pdf'));
    fixture.detectChanges();

    expect(service.addFile).toHaveBeenCalledWith(GUID, expect.any(File));
    expect(element.querySelector('.file-name').textContent.trim()).toBe('poster.pdf');
  });

  it("shows the API's reason when it refuses a file", () => {
    const { fixture, element } = render(true, []);
    service.addFile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'A submission can have up to 3 files.' } }))
    );

    fixture.componentInstance.upload(new File(['x'], 'deck.pdf'));
    fixture.detectChanges();

    expect(element.querySelector('[role=alert]').textContent).toContain('up to 3 files');
  });

  it('says the limits to a student in words of its own, and not to an admin reviewing (#2938)', () => {
    expect(render(true).element.querySelector('.files-limits').textContent).toContain('up to 100 MB each · up to 3 files');
    TestBed.resetTestingModule();
    expect(render(false).element.querySelector('.files-limits')).toBeNull();
  });

  it('hides the picker once the submission has three files', () => {
    const three = [1, 2, 3].map((n) => ({ ...deck, guid: `f${n}`, name: `deck ${n}.pdf` }));
    const { element } = render(true, three);

    expect(element.querySelectorAll('.file')).toHaveLength(3);
    expect(element.querySelector('tamu-gisc-file')).toBeNull();
  });

  /**
   * #3093. The same list for a session's slides: a speaker's own, up to three, with no download for them, and every
   * speaker's for the admins, each labelled with who uploaded it.
   */
  describe('with a source of its own (#3093)', () => {
    let source: { list: Mock; add: Mock; remove: Mock };

    function renderSource(files: Array<object> = [deck]) {
      source = { list: vi.fn(() => of(files)), add: vi.fn(), remove: vi.fn(() => of(undefined)) };
      TestBed.configureTestingModule({ providers: [{ provide: UserSubmissionsService, useValue: service }] });

      const fixture = TestBed.createComponent(SubmissionFilesComponent);
      fixture.componentRef.setInput('source', source);
      fixture.componentRef.setInput('editable', true);
      fixture.componentRef.setInput('limitMessage', 'You can upload up to 3 files for each session.');
      fixture.componentRef.setInput('pickLabel', 'Upload slides');
      fixture.componentRef.setInput('emptyLabel', 'No slides uploaded yet.');
      fixture.detectChanges();

      return { fixture, element: fixture.nativeElement as HTMLElement };
    }

    it('reads the files from the source, not a submission', () => {
      const { element } = renderSource();

      expect(source.list).toHaveBeenCalled();
      expect(service.getFiles).not.toHaveBeenCalled();
      expect(element.querySelector('.file-name').textContent.trim()).toBe('Texas Watersheds.pptx');
    });

    it('shows the name, size and date with no download where the source offers none', () => {
      const { element } = renderSource();

      expect(element.querySelector('button.file-name')).toBeNull();
      expect(element.querySelector('span.file-name').textContent.trim()).toBe('Texas Watersheds.pptx');
      expect(element.querySelector('.file-detail').textContent).toContain('4.2 MB');
    });

    it('offers an upload when there is none, in its own words', () => {
      const { element } = renderSource([]);

      expect(element.querySelector('.files-empty').textContent.trim()).toBe('No slides uploaded yet.');
      expect(element.querySelector('tamu-gisc-file').textContent).toContain('Upload slides');
      expect(element.querySelector('.files-limits').textContent).toContain('up to 3 files');
    });

    it('adds an upload beside the file there, with Remove on each', () => {
      const { fixture, element } = renderSource();
      const final = { guid: 'f9', name: 'final.pdf', size: 2048, uploaded: '2026-11-15T18:00:00.000Z' };
      source.add.mockReturnValue(of({ type: HttpEventType.Response, body: final }));

      expect(element.querySelector('tamu-gisc-file').textContent).toContain('Upload slides');

      fixture.componentInstance.upload(new File(['x'], 'final.pdf'));
      fixture.detectChanges();

      expect(source.add).toHaveBeenCalledWith(expect.any(File));
      expect([...element.querySelectorAll('.file-name')].map((e) => e.textContent.trim())).toEqual([
        'Texas Watersheds.pptx',
        'final.pdf'
      ]);
      expect(element.querySelectorAll('button.danger')).toHaveLength(2);
    });

    it('refuses a fourth file before sending it, in the words it is given', () => {
      const three = [1, 2, 3].map((n) => ({ ...deck, guid: `f${n}`, name: `deck ${n}.pdf` }));
      const { fixture, element } = renderSource(three);

      fixture.componentInstance.upload(new File(['x'], 'extra.pdf'));
      fixture.detectChanges();

      expect(source.add).not.toHaveBeenCalled();
      expect(element.querySelector('[role=alert]').textContent).toBe(
        'You can upload up to 3 files for each session. Remove one before adding another.'
      );
    });

    it('labels each file with who uploaded it, where the source says', () => {
      const { element } = renderSource([
        { ...deck, uploadedBy: 'Avery Example' },
        { ...deck, guid: 'f2', name: 'theirs.pdf', uploadedBy: 'Blair Sample' }
      ]);

      expect([...element.querySelectorAll('.file-by')].map((e) => e.textContent.trim())).toEqual([
        'Avery Example',
        'Blair Sample'
      ]);
    });

    it('labels nothing on a list whose files carry no uploader', () => {
      expect(renderSource().element.querySelector('.file-by')).toBeNull();
    });

    it('removes through the source', () => {
      const { fixture, element } = renderSource();

      fixture.componentInstance.remove(deck);
      fixture.detectChanges();

      expect(source.remove).toHaveBeenCalledWith('f1');
      expect(element.querySelector('.files-empty')).not.toBeNull();
    });

    it("checks a file by the submission files' rules before sending it", () => {
      const { fixture, element } = renderSource();

      fixture.componentInstance.upload(new File(['x'], 'notes.docx'));
      fixture.detectChanges();

      expect(source.add).not.toHaveBeenCalled();
      expect(element.querySelector('[role=alert]').textContent).toContain('notes.docx is not a PowerPoint or PDF file');
    });
  });

  /** #3174: a session's slides, every speaker's, downloaded at once on its admin page. */
  describe('Download all (#3174)', () => {
    const second = { ...deck, guid: 'f2', name: 'Lightning.pdf' };
    const zip = new Blob(['zip']);

    function renderZippable(files: Array<object>, downloadAll: Mock | null = vi.fn(() => of(zip))) {
      TestBed.configureTestingModule({ providers: [{ provide: UserSubmissionsService, useValue: service }] });

      const fixture = TestBed.createComponent(SubmissionFilesComponent);
      fixture.componentRef.setInput('source', {
        list: () => of(files),
        add: vi.fn(),
        remove: vi.fn(),
        download: vi.fn(),
        // null: a source that cannot zip, so it has no downloadAll at all.
        ...(downloadAll ? { downloadAll } : {}),
        downloadAllName: () => 'Panel - slides.zip'
      });
      fixture.detectChanges();

      return { fixture, element: fixture.nativeElement as HTMLElement, downloadAll };
    }

    beforeEach(() => (downloadFile as Mock).mockClear());

    it('offers every file as one zip once there are two, saved under the name the source gives', () => {
      const { fixture, element, downloadAll } = renderZippable([deck, second]);
      const button = element.querySelector<HTMLButtonElement>('button.files-all');

      expect(button.textContent.trim()).toBe('Download all 2 files');

      button.click();
      fixture.detectChanges();

      expect(downloadAll).toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith(zip, 'Panel - slides.zip', 'application/zip');
    });

    it('offers no zip for one file, or where the source cannot make one', () => {
      expect(renderZippable([deck]).element.querySelector('.files-all')).toBeNull();
      TestBed.resetTestingModule();
      expect(renderZippable([deck, second], null).element.querySelector('.files-all')).toBeNull();
    });

    it('says so when the zip cannot be made', () => {
      // A download asks for a blob, so the API's refusal arrives as one, with no message to read.
      const { fixture, element } = renderZippable(
        [deck, second],
        vi.fn(() => throwError(() => new HttpErrorResponse({ status: 404, error: new Blob(['{}']) })))
      );

      element.querySelector<HTMLButtonElement>('button.files-all').click();
      fixture.detectChanges();

      expect(downloadFile).not.toHaveBeenCalled();
      expect(element.querySelector('[role=alert]').textContent).toContain('The files could not be downloaded together.');
    });
  });
});

/** An admin looking through a submission's files in the page (#3090): its PDFs preview; a PowerPoint is downloaded. */
describe('SubmissionFilesComponent preview', () => {
  const GUID = '11111111-2222-4333-8444-555555555555';
  const deck = { guid: 'f1', name: 'Made-up deck.pptx', size: 1, uploaded: '2026-11-14T18:00:00.000Z' };
  const poster = { guid: 'f2', name: 'Made-up poster.pdf', size: 1, uploaded: '2026-11-14T18:01:00.000Z' };
  const handout = { guid: 'f3', name: 'Made-up handout.pdf', size: 1, uploaded: '2026-11-14T18:02:00.000Z' };

  let getFilePreview: Mock;

  function render(previewable: boolean) {
    getFilePreview = vi.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/pdf' })));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserSubmissionsService,
          useValue: { getFiles: vi.fn(() => of([deck, poster, handout])), getFileContents: vi.fn(), getFilePreview }
        }
      ]
    });

    const fixture = TestBed.createComponent(SubmissionFilesComponent);
    fixture.componentRef.setInput('submissionGuid', GUID);
    fixture.componentRef.setInput('previewable', previewable);
    fixture.detectChanges();

    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => {
    // jsdom has no object URLs.
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:made-up'), revokeObjectURL: vi.fn() });
  });

  it('offers Preview on each PDF only, and only where the list is previewable', () => {
    expect(render(false).element.querySelectorAll('.file-preview-link')).toHaveLength(0);

    TestBed.resetTestingModule();
    const { element } = render(true);
    const offered = Array.from(element.querySelectorAll('.file'))
      .filter((row) => row.querySelector('.file-preview-link'))
      .map((row) => row.querySelector('.file-name')?.textContent?.trim());

    expect(offered).toEqual(['Made-up poster.pdf', 'Made-up handout.pdf']);
  });

  it('shows a PDF under the list, and pages through the PDFs, wrapping round', () => {
    const { fixture, element } = render(true);

    fixture.componentInstance.preview(poster);
    fixture.detectChanges();

    expect(getFilePreview).toHaveBeenLastCalledWith(GUID, 'f2');
    expect(element.querySelector('.file-preview-name')?.textContent).toBe('Made-up poster.pdf');
    expect(element.querySelector('iframe.file-preview-frame')).not.toBeNull();

    fixture.componentInstance.step(1);
    fixture.detectChanges();
    expect(element.querySelector('.file-preview-name')?.textContent).toBe('Made-up handout.pdf');

    fixture.componentInstance.step(1);
    fixture.detectChanges();
    expect(element.querySelector('.file-preview-name')?.textContent).toBe('Made-up poster.pdf');

    fixture.componentInstance.closePreview();
    fixture.detectChanges();
    expect(element.querySelector('.file-preview')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
