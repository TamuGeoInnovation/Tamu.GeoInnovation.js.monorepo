import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { combineLatest, from, map, of, shareReplay, startWith, switchMap } from 'rxjs';

import {
  SessionFilesService,
  SpeakerEditPage,
  SpeakerEditsService,
  UniversityService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, FileComponent, SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';
import {
  classBannerSpeaker,
  FilesSource,
  ImagePreviewComponent,
  ParseDateTimeStringsPipe,
  serverMessage,
  SpeakerClassBannerComponent,
  SubmissionFilesComponent,
  UploadImagePicker
} from '@tamu-gisc/gisday/platform/ngx/common';
import { NO_SLIDES_FOR_SESSION, SESSION_FILES_LIMIT, SpeakerSessionDto } from '@tamu-gisc/gisday/common';

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
    MarkdownParsePipe,
    ImagePreviewComponent,
    SpeakerClassBannerComponent,
    SubmissionFilesComponent,
    ParseDateTimeStringsPipe
  ]
})
export class PeopleEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly edits = inject(SpeakerEditsService);
  private readonly sessionFiles = inject(SessionFilesService);
  private readonly destroyRef = inject(DestroyRef);

  /** What a fourth file on a session is refused with (#3093). */
  public readonly sessionFilesLimit = SESSION_FILES_LIMIT;
  /** What a session with no slides (#3147) says in place of its upload. */
  public readonly noSlides = NO_SLIDES_FOR_SESSION;

  /**
   * The sessions the speaker presents this season (#3093), each with the speaker's own slides as a source for the shared
   * files list: up to three, uploaded and removed through the link, kept at once with no review. Null until listed.
   */
  public readonly sessions = signal<Array<{ session: SpeakerSessionDto; slides: FilesSource }> | null>(null);

  /** The season's universities, for a speaker to choose theirs from, as the admin speaker form does (#2953). */
  public readonly universities$ = inject(UniversityService).getEntitiesForActiveSeason().pipe(shareReplay(1));

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

  /** The photo picker, on the shared upload rule (#3074). */
  public readonly photoPicker = new UploadImagePicker('The photo', { shrink: true });
  /** The answer to a request for a link. */
  public readonly requested = signal<string | null>(null);

  public readonly form = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    affiliation: new FormControl('', { nonNullable: true }),
    socialMedia: new FormControl('', { nonNullable: true }),
    graduationYear: new FormControl('', { nonNullable: true }),
    university: new FormControl('', { nonNullable: true })
  });

  /** What the photo box shows: the photo just chosen, else the current one, else nothing (the person icon). */
  public readonly photoSrc = computed(() => {
    const photo = this.profile()?.photo;

    return this.photoPreview() ?? (photo ? this.photoUrl(photo) : null);
  });

  /**
   * The speaker as the banner on their photo sees it: the University and Graduation year chosen on this page, as they
   * change, so they see the result before sending it (#2956). The admin speaker form draws its banner the same way.
   */
  public readonly bannerSpeaker = toSignal(
    combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
      this.universities$.pipe(startWith([]))
    ]).pipe(map(([value, universities]) => classBannerSpeaker(value.university, value.graduationYear, universities)))
  );

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

    // The shared upload rule (#3074): what the API takes, refused in its words.
    if (file && !this.photoPicker.choose(file)) {
      this.problem.set(this.photoPicker.problem());
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

    // The photo shrunk as it is sent (#3177), as the admin's speaker form sends one.
    const photo = this.photo();

    from(photo ? this.photoPicker.ready(photo) : Promise.resolve(null))
      .pipe(
        switchMap((ready) => this.edits.propose(token, this.form.getRawValue(), ready)),
        takeUntilDestroyed(this.destroyRef)
      )
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
          this.loadSessions(token);
        },
        error: () => this.page.set('invalid')
      });
  }

  /** The speaker's sessions and their slides (#3093). A failure leaves the profile as it is, with no sessions shown. */
  private loadSessions(token: string): void {
    this.sessionFiles
      .forLink(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sessions) =>
          this.sessions.set(
            sessions.map((session) => ({
              session,
              slides: {
                list: () => of(session.files),
                add: (file: File) => this.sessionFiles.upload(token, session.guid, file),
                remove: (fileGuid: string) => this.sessionFiles.remove(token, session.guid, fileGuid)
              }
            }))
          ),
        error: () => this.sessions.set([])
      });
  }
}

function messageOf(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse && err.status === 413) {
    return 'The photo is too large. Please send one under 5 MB.';
  }

  return serverMessage(err, fallback);
}
