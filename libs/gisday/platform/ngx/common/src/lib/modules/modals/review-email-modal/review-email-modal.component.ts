import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { REVIEW_EMAIL_PLACEHOLDERS, emailHtml, fillReviewEmail } from '@tamu-gisc/gisday/common';
import { ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

/** What the window is opened with: the decision, and the email each kind of submission would get. */
export interface ReviewEmailModalData {
  acceptance?: boolean;
  /** What the window is for, when it is not a decision: "Send final reminder" (#3017). Its button then says "Send". */
  verb?: string;
  preview: Observable<ReviewEmailPreview>;
  /** Anything else the reviewer should know first, such as how many have been reviewed before. */
  note?: string;
  /**
   * Whether the subject is edited too (#3023, the profile email): it comes back beside the text, as `<kind>:subject`.
   * The review emails keep their subject fixed.
   */
  editableSubject?: boolean;
  /** The placeholders the window lists; the review emails' when not given. */
  placeholders?: ReadonlyArray<string>;
}

/** What it closes with: the text of each kind's email, as the reviewer left it, or `null` when nothing is to be sent. */
export type ReviewEmailModalResult = Record<string, string> | null;

/**
 * Shows the email a review sends before it is sent (#2981): one box per kind of email in the selection (accepted
 * posters, accepted presentations, rejections), each editable, with a preview filled in for the first submission of that
 * kind. Nothing is decided or sent until **Send**.
 */
@Component({
  selector: 'tamu-gisc-review-email-modal',
  templateUrl: './review-email-modal.component.html',
  styleUrls: ['./review-email-modal.component.scss'],
  imports: [ReactiveFormsModule, ButtonComponent, TextboxComponent]
})
export class ReviewEmailModalComponent implements OnInit {
  private readonly mr = inject(ModalRefService);
  private readonly data = inject<ReviewEmailModalData>(MODAL_DATA);

  public readonly placeholders = (this.data.placeholders ?? REVIEW_EMAIL_PLACEHOLDERS).join(', ');
  public readonly editableSubject = !!this.data.editableSubject;
  public readonly verb = this.data.verb ?? (this.data.acceptance ? 'Approve' : 'Reject');
  /** The button's words before its count: "Approve and send", or for anything but a decision, "Send". */
  public readonly sendWords = this.data.verb ? 'Send' : `${this.verb} and send`;
  public readonly note = this.data.note ?? '';
  public readonly preview = signal<ReviewEmailPreview | null>(null);
  public readonly failed = signal(false);
  public readonly form = new FormGroup<Record<string, FormControl<string>>>({});

  public ngOnInit(): void {
    this.data.preview.subscribe({
      next: (preview) => {
        for (const group of preview.groups) {
          this.form.addControl(group.kind, new FormControl(group.template, { nonNullable: true }));

          if (this.editableSubject) {
            this.form.addControl(`${group.kind}:subject`, new FormControl(group.subject, { nonNullable: true }));
          }
        }

        this.preview.set(preview);
      },
      error: () => this.failed.set(true)
    });
  }

  /** The email as the first submission of a kind would get it, from the text as it now stands. */
  public example(kind: string, values: Record<string, string>): string {
    return fillReviewEmail(this.form.controls[kind]?.value ?? '', values);
  }

  /** The same, formatted from its Markdown as it will arrive (#3044); Angular's sanitiser checks it on the way in. */
  public exampleHtml(kind: string, values: Record<string, string>): string {
    return emailHtml(this.example(kind, values));
  }

  /** The subject as the first of a kind would get it, from the subject as it now stands (#3023). */
  public exampleSubject(kind: string, values: Record<string, string>): string {
    return fillReviewEmail(this.form.controls[`${kind}:subject`]?.value ?? '', values);
  }

  public total(preview: ReviewEmailPreview): number {
    return preview.groups.reduce((sum, group) => sum + group.count, 0);
  }

  public send() {
    this.mr.close(this.form.getRawValue());
  }

  public cancel() {
    this.mr.close(null);
  }
}
