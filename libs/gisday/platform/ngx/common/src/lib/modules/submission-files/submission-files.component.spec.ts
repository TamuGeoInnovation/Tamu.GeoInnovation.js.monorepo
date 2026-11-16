import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { SubmissionFilesComponent } from './submission-files.component';

/** The files a student attaches to their submission, and an admin downloads (#2933). */
describe('SubmissionFilesComponent', () => {
  const GUID = '11111111-2222-4333-8444-555555555555';
  const deck = { guid: 'f1', name: 'Texas Watersheds.pptx', size: 4_400_000, uploaded: '2026-11-14T18:00:00.000Z' };

  let service: { getFiles: jest.Mock; addFile: jest.Mock; deleteFile: jest.Mock; getFileContents: jest.Mock };

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
    service = { getFiles: jest.fn(), addFile: jest.fn(), deleteFile: jest.fn(), getFileContents: jest.fn() };
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

  /** #3093. The same list for a session's slides: one file, which the next upload replaces, and no download for a speaker. */
  describe('with a source of its own (#3093)', () => {
    let source: { list: jest.Mock; add: jest.Mock; remove: jest.Mock };

    function renderSource(files = [deck]) {
      source = { list: jest.fn(() => of(files)), add: jest.fn(), remove: jest.fn(() => of(undefined)) };
      TestBed.configureTestingModule({ providers: [{ provide: UserSubmissionsService, useValue: service }] });

      const fixture = TestBed.createComponent(SubmissionFilesComponent);
      fixture.componentRef.setInput('source', source);
      fixture.componentRef.setInput('editable', true);
      fixture.componentRef.setInput('max', 1);
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
      expect(element.querySelector('.files-limits').textContent).toContain('uploading again replaces it');
    });

    it('offers Replace and Remove when there is one, and a replacement takes its place', () => {
      const { fixture, element } = renderSource();
      const final = { guid: 'f9', name: 'final.pdf', size: 2048, uploaded: '2026-11-15T18:00:00.000Z' };
      source.add.mockReturnValue(of({ type: HttpEventType.Response, body: final }));

      expect(element.querySelector('tamu-gisc-file').textContent).toContain('Replace');
      expect(element.textContent).toContain('Remove');

      fixture.componentInstance.upload(new File(['x'], 'final.pdf'));
      fixture.detectChanges();

      expect(source.add).toHaveBeenCalledWith(expect.any(File));
      expect([...element.querySelectorAll('.file-name')].map((e) => e.textContent.trim())).toEqual(['final.pdf']);
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
});
