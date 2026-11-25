import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { PendingSpeakerEdit, SpeakerEditFields, SpeakerEditsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { provideAdminDetailsPage, readRefusal, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

/** The fields a speaker can propose, in the order the review shows them. */
const FIELDS: Array<{ key: keyof SpeakerEditFields; label: string }> = [
  { key: 'university', label: 'University' },
  { key: 'graduationYear', label: 'Graduation year' },
  { key: 'affiliation', label: 'Affiliation' },
  { key: 'socialMedia', label: 'Link' },
  { key: 'description', label: 'Bio' }
];

/**
 * Changes speakers proposed to their own profiles through their edit links (#2936), each shown as it is now beside what
 * they sent, with the proposed photo. Nothing reaches the public site until it is approved here.
 */
@Component({
  selector: 'tamu-gisc-speaker-edits',
  templateUrl: './speaker-edits.component.html',
  styleUrls: ['./speaker-edits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CentralDatePipe, ButtonComponent, MarkdownParsePipe],
  providers: [provideAdminDetailsPage(() => SpeakerEditsComponent)]
})
export class SpeakerEditsComponent extends BaseAdminDetailsPageComponent implements OnInit, OnDestroy {
  private readonly edits = inject(SpeakerEditsService);
  private readonly ns = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly fields = FIELDS;
  public readonly pending = signal<Array<PendingSpeakerEdit> | null>(null);
  /** Proposed photos, as object URLs, by edit. */
  public readonly photos = signal<Record<string, string>>({});
  public readonly busy = signal<string | null>(null);

  public ngOnInit(): void {
    this.load();
  }

  public ngOnDestroy(): void {
    Object.values(this.photos()).forEach((url) => URL.revokeObjectURL(url));
  }

  /** Whether a field changed, so the review can mark it. */
  public changed(edit: PendingSpeakerEdit, key: keyof SpeakerEditFields): boolean {
    return this.text(edit.proposed, key) !== this.text(edit.current, key);
  }

  /** A field as the review shows it: a university by its name (#2953). */
  public text(fields: SpeakerEditFields, key: keyof SpeakerEditFields): string {
    const value = fields[key];

    return key === 'university' ? ((value as SpeakerEditFields['university'])?.name ?? '') : ((value as string) ?? '');
  }

  public decide(edit: PendingSpeakerEdit, decision: 'approve' | 'reject'): void {
    this.busy.set(edit.guid);

    const request: Observable<unknown> =
      decision === 'approve' ? this.edits.approve(edit.guid) : this.edits.reject(edit.guid);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busy.set(null);
        this.pending.update((list) => (list ?? []).filter((e) => e.guid !== edit.guid));
        this.ns.toast({
          id: `speaker-edit-${decision}`,
          title: decision === 'approve' ? 'Edit approved' : 'Edit rejected',
          message:
            decision === 'approve'
              ? `${edit.speaker.firstName} ${edit.speaker.lastName}'s profile is updated.`
              : `${edit.speaker.firstName} ${edit.speaker.lastName}'s profile is unchanged.`
        });
      },
      error: (err) => {
        this.busy.set(null);
        // Why, as the dashboards say it (#3083, #3038): a missing permission, the server's own reason, or, when the
        // server failed, to try again.
        this.ns.toast({
          id: 'speaker-edit-error',
          title: 'Could not save the decision',
          message: readRefusal(err) ?? serverMessage(err, 'Please try again.')
        });
      }
    });
  }

  private load(): void {
    this.edits
      .pending()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.pending.set(list);
          list.filter((e) => e.photo).forEach((e) => this.loadPhoto(e.guid));
        },
        error: () => this.pending.set([])
      });
  }

  private loadPhoto(guid: string): void {
    this.edits
      .photo(guid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => this.photos.update((photos) => ({ ...photos, [guid]: URL.createObjectURL(blob) })));
  }
}
