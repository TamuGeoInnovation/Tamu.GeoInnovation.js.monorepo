import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

import { SUBMISSION_FILE_RULES, SubmissionFileDto, megabytes, submissionFileProblem } from '@tamu-gisc/gisday/common';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { downloadFile } from '@tamu-gisc/common/utils/ui';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { serverMessage } from '../../utils/server-message';

/**
 * Where a list of files is read from and sent to (#3093): a submission's files by default, or anything else kept under
 * the same rules, such as a session's slides.
 */
export interface FilesSource {
  list(): Observable<Array<SubmissionFileDto>>;
  add(file: File): Observable<HttpEvent<SubmissionFileDto>>;
  remove(fileGuid: string): Observable<unknown>;
  /** Left out where the files are not downloaded from: a speaker sees their slides' name, size and date only. */
  download?(fileGuid: string): Observable<Blob>;
}

/**
 * The files attached to one poster or presentation submission (#2933): listed with a download for each, and, when
 * `editable`, a picker that uploads a file as soon as it is chosen and a Remove on each. The student's submission page
 * uses it editable, before and after review, since finalists send their slides after being accepted; the admins' review
 * page uses it to download.
 *
 * With a `source`, the same list for other files kept under the same rules (#3093): a speaker's slides on their edit
 * link, and the admins' downloads of them on the session's page. With `max` 1, the picker replaces the file there.
 */
@Component({
  selector: 'tamu-gisc-submission-files',
  templateUrl: './submission-files.component.html',
  styleUrls: ['./submission-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FileComponent, DatePipe]
})
export class SubmissionFilesComponent implements OnInit {
  /** Asked for the submissions service only when there is no source, so a page with one needs none. */
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** The submission whose files these are, when no `source` is given. */
  public readonly submissionGuid = input<string>();
  public readonly source = input<FilesSource | null>(null);
  public readonly editable = input(false);
  /** How many files the list holds. At 1, the picker replaces the file there. */
  public readonly max = input<number>(SUBMISSION_FILE_RULES.maxFiles);
  public readonly pickLabel = input('Attach a file');
  public readonly emptyLabel = input('No files attached yet.');

  public readonly rules = SUBMISSION_FILE_RULES;
  public readonly limit = megabytes(SUBMISSION_FILE_RULES.maxBytes);

  public readonly files = signal<Array<SubmissionFileDto> | null>(null);
  /** The file being uploaded and how far it has got, 0 to 100. */
  public readonly uploading = signal<{ name: string; percent: number } | null>(null);
  public readonly problem = signal<string | null>(null);
  public readonly busy = signal<string | null>(null);

  private readonly picker = viewChild(FileComponent);

  public ngOnInit(): void {
    this.load();
  }

  public size(bytes: number | null): string {
    return bytes === null ? 'missing' : megabytes(bytes);
  }

  /** Whether the files can be downloaded from here. */
  public get downloadable(): boolean {
    return typeof this.from().download === 'function';
  }

  /** Whether choosing a file replaces the one there, rather than adding another. */
  public get replaces(): boolean {
    return this.max() === 1;
  }

  public upload(file: File | undefined): void {
    if (!file) {
      return;
    }

    const problem = submissionFileProblem(file.name, file.size, this.replaces ? 0 : (this.files()?.length ?? 0));

    if (problem) {
      this.problem.set(problem);
      this.picker()?.reset();
      return;
    }

    this.problem.set(null);
    this.uploading.set({ name: file.name, percent: 0 });

    this.from()
      .add(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploading.set({ name: file.name, percent: Math.round((100 * event.loaded) / event.total) });
          } else if (event.type === HttpEventType.Response && event.body) {
            this.files.update((files) => (this.replaces ? [event.body] : [...(files ?? []), event.body]));
          }
        },
        error: (err) => {
          this.uploading.set(null);
          this.problem.set(messageOf(err, `${file.name} could not be uploaded.`));
          this.picker()?.reset();
        },
        complete: () => {
          this.uploading.set(null);
          this.picker()?.reset();
        }
      });
  }

  public download(file: SubmissionFileDto): void {
    const source = this.from();

    if (!source.download) {
      return;
    }

    this.busy.set(file.guid);

    source
      .download(file.guid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contents) => {
          this.busy.set(null);
          downloadFile(contents, file.name, contents.type);
        },
        error: (err) => {
          this.busy.set(null);
          this.problem.set(messageOf(err, `${file.name} could not be downloaded.`));
        }
      });
  }

  public remove(file: SubmissionFileDto): void {
    this.busy.set(file.guid);

    this.from()
      .remove(file.guid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(null);
          this.files.update((files) => (files ?? []).filter((f) => f.guid !== file.guid));
        },
        error: (err) => {
          this.busy.set(null);
          this.problem.set(messageOf(err, `${file.name} could not be removed.`));
        }
      });
  }

  /** The `source`, or the submission's own files. */
  private from(): FilesSource {
    return this.source() ?? submissionFiles(this.injector.get(UserSubmissionsService), this.submissionGuid());
  }

  private load(): void {
    this.from()
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (files) => this.files.set(files),
        error: (err) => {
          this.files.set([]);
          this.problem.set(messageOf(err, 'The files could not be listed.'));
        }
      });
  }
}

/** A submission's files (#2933), as a source. */
function submissionFiles(submissions: UserSubmissionsService, guid: string): FilesSource {
  return {
    list: () => submissions.getFiles(guid),
    add: (file) => submissions.addFile(guid, file),
    remove: (fileGuid) => submissions.deleteFile(guid, fileGuid),
    download: (fileGuid) => submissions.getFileContents(guid, fileGuid)
  };
}

/** The API's own message when it gave one ("… is not a PowerPoint or PDF file"), otherwise `fallback` (#2966). */
function messageOf(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse && err.status === 413) {
    return `${fallback} Files can be up to ${megabytes(SUBMISSION_FILE_RULES.maxBytes)}.`;
  }

  return serverMessage(err, fallback);
}
