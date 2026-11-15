import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { SUBMISSION_FILE_RULES, SubmissionFileDto, megabytes, submissionFileProblem } from '@tamu-gisc/gisday/common';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { downloadFile } from '@tamu-gisc/common/utils/ui';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/**
 * The files attached to one poster or presentation submission (#2933): listed with a download for each, and, when
 * `editable`, a picker that uploads a file as soon as it is chosen and a Remove on each. The student's submission page
 * uses it editable, before and after review, since finalists send their slides after being accepted; the admins' review
 * page uses it to download.
 */
@Component({
  selector: 'tamu-gisc-submission-files',
  templateUrl: './submission-files.component.html',
  styleUrls: ['./submission-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FileComponent, DatePipe]
})
export class SubmissionFilesComponent implements OnInit {
  private readonly submissions = inject(UserSubmissionsService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly submissionGuid = input.required<string>();
  public readonly editable = input(false);

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

  public upload(file: File | undefined): void {
    if (!file) {
      return;
    }

    const problem = submissionFileProblem(file.name, file.size, this.files()?.length ?? 0);

    if (problem) {
      this.problem.set(problem);
      this.picker()?.reset();
      return;
    }

    this.problem.set(null);
    this.uploading.set({ name: file.name, percent: 0 });

    this.submissions
      .addFile(this.submissionGuid(), file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploading.set({ name: file.name, percent: Math.round((100 * event.loaded) / event.total) });
          } else if (event.type === HttpEventType.Response && event.body) {
            this.files.update((files) => [...(files ?? []), event.body]);
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
    this.busy.set(file.guid);

    this.submissions
      .getFileContents(this.submissionGuid(), file.guid)
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

    this.submissions
      .deleteFile(this.submissionGuid(), file.guid)
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

  private load(): void {
    this.submissions
      .getFiles(this.submissionGuid())
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

/** The API's own message when it gave one ("… is not a PowerPoint or PDF file"), otherwise `fallback`. */
function messageOf(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 413) {
      return `${fallback} Files can be up to ${megabytes(SUBMISSION_FILE_RULES.maxBytes)}.`;
    }

    const message = err.error?.message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return fallback;
}
