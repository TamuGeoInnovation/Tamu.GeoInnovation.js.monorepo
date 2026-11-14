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
});
