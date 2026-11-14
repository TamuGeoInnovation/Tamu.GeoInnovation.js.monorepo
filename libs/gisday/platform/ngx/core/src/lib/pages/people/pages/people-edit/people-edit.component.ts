import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';

import { SpeakerEditPage, SpeakerEditsService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, FileComponent, SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';

/**
 * A speaker editing their own presenter profile through the link emailed to them (#2936), with no account. Without a
 * link, the page asks for their email address and sends one. What they send waits for an admin before it is public.
 */
@Component({
  selector: 'tamu-gisc-people-edit',
  templateUrl: './people-edit.component.html',
  styleUrls: ['./people-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AsyncPipe,
    DatePipe,
    ButtonComponent,
    FileComponent,
    SelectComponent,
    TextboxComponent,
    MarkdownParsePipe
  ]
})
export class PeopleEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly edits = inject(SpeakerEditsService);
  private readonly destroyRef = inject(DestroyRef);

  /** The season's universities, for a speaker to choose theirs from, as the admin speaker form does (#2953). */
  public readonly universities$ = inject(UniversityService).getEntitiesForActiveSeason();

  public readonly token = signal<string | null>(null);
  /** The profile behind the link, or 'invalid' when the link does not work. */
  public readonly page = signal<SpeakerEditPage | 'invalid' | null>(null);
  /** The profile, once a working link has loaded it. */
  public readonly profile = computed(() => {
    const page = this.page();

    return page && page !== 'invalid' ? page : null;
  });
  public readonly invalid = computed(() => this.page() === 'invalid');
  public readonly photo = signal<File | null>(null);
  public readonly photoPreview = signal<string | null>(null);
  public readonly sending = signal(false);
  public readonly sent = signal(false);
  public readonly problem = signal<string | null>(null);
  /** The answer to a request for a link. */
  public readonly requested = signal<string | null>(null);

  public readonly form = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    affiliation: new FormControl('', { nonNullable: true }),
    socialMedia: new FormControl('', { nonNullable: true }),
    graduationYear: new FormControl('', { nonNullable: true }),
    university: new FormControl('', { nonNullable: true })
  });

  public readonly requestForm = new FormGroup({ email: new FormControl('', { nonNullable: true }) });

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const token = params.get('token');

      this.token.set(token);

      if (token) {
        this.load(token);
      }
    });
  }

  public choosePhoto(file: File | undefined): void {
    this.problem.set(null);

    if (file && !/^image\/(jpeg|png)$/.test(file.type)) {
      this.problem.set(`${file.name} is not a JPEG or PNG photo.`);
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      this.problem.set(`${file.name} is larger than 5 MB.`);
      return;
    }

    const previous = this.photoPreview();

    if (previous) {
      URL.revokeObjectURL(previous);
    }

    this.photo.set(file ?? null);
    this.photoPreview.set(file ? URL.createObjectURL(file) : null);
  }

  public submit(): void {
    const token = this.token();

    if (!token || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.problem.set(null);

    this.edits
      .propose(token, this.form.getRawValue(), this.photo())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.sent.set(true);
        },
        error: (err) => {
          this.sending.set(false);
          this.problem.set(messageOf(err, 'Your changes could not be sent. Please try again.'));
        }
      });
  }

  public requestLink(): void {
    const email = this.requestForm.getRawValue().email.trim();

    if (!email) {
      return;
    }

    this.edits
      .request(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (answer) => this.requested.set(answer.message),
        error: () => this.requested.set('The request could not be sent. Please try again later.')
      });
  }

  public photoUrl(path: string): string {
    return `assets/uploads/${path}`;
  }

  private load(token: string): void {
    this.page.set(null);

    this.edits
      .forLink(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          // What they already proposed, if anything, so a second visit carries on from it.
          const start = page.pending ?? page.current;

          this.form.setValue({
            description: start.description ?? '',
            affiliation: start.affiliation ?? '',
            socialMedia: start.socialMedia ?? '',
            graduationYear: start.graduationYear ?? '',
            university: start.university?.guid ?? ''
          });
          this.page.set(page);
        },
        error: () => this.page.set('invalid')
      });
  }
}

function messageOf(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 413) {
      return 'The photo is too large. Please send one under 5 MB.';
    }

    const message = err.error?.message;

    if (typeof message === 'string' && message) {
      return message;
    }
  }

  return fallback;
}
