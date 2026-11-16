import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  EMAIL_SENDER_KEY,
  EmailSenderChoice,
  EmailSenderChoices,
  REVIEW_EMAIL_PLACEHOLDERS,
  emailHtml,
  fillReviewEmail,
  hasEmailDesign,
  siteEmailHtml
} from '@tamu-gisc/gisday/common';
import { ContactService, ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { GISDAY_SITE } from '../../../site/site';

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

/**
 * What it closes with: the text of each kind's email, as the reviewer left it, and the address chosen to send as under
 * `EMAIL_SENDER_KEY` (#3100), or `null` when nothing is to be sent.
 */
export type ReviewEmailModalResult = Record<string, string> | null;

/**
 * Shows the email a review sends before it is sent (#2981): one box per kind of email in the selection (accepted
 * posters, accepted presentations, rejections), each editable, with a preview filled in for the first submission of that
 * kind. Nothing is decided or sent until **Send**.
 *
 * Its **Send as** box (#3100) offers the addresses the API says the admin may send as, their own first and chosen, and the
 * preview shows the From recipients will see. With no choice to offer, the email goes from the site, as before.
 */
@Component({
  selector: 'tamu-gisc-review-email-modal',
  templateUrl: './review-email-modal.component.html',
  styleUrls: ['./review-email-modal.component.scss'],
  imports: [ReactiveFormsModule, ButtonComponent, SelectComponent, TextboxComponent]
})
export class ReviewEmailModalComponent implements OnInit {
  private readonly mr = inject(ModalRefService);
  private readonly data = inject<ReviewEmailModalData>(MODAL_DATA);
  private readonly contact = inject(ContactService);
  private readonly site = inject(GISDAY_SITE);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly placeholders = (this.data.placeholders ?? REVIEW_EMAIL_PLACEHOLDERS).join(', ');
  public readonly editableSubject = !!this.data.editableSubject;
  public readonly verb = this.data.verb ?? (this.data.acceptance ? 'Approve' : 'Reject');
  /** The button's words before its count: "Approve and send", or for anything but a decision, "Send". */
  public readonly sendWords = this.data.verb ? 'Send' : `${this.verb} and send`;
  public readonly note = this.data.note ?? '';
  public readonly preview = signal<ReviewEmailPreview | null>(null);
  public readonly failed = signal(false);
  public readonly form = new FormGroup<Record<string, FormControl<string>>>({});
  /** The form's key for the "Send as" box (#3100). */
  public readonly senderKey = EMAIL_SENDER_KEY;
  /** Who the admin may send as, from the API (#3100). */
  public readonly senders = signal<EmailSenderChoices | null>(null);
  public readonly sendersFailed = signal(false);

  public ngOnInit(): void {
    // Their own address first, and chosen (#3100); it comes back with the texts under `EMAIL_SENDER_KEY`.
    this.contact.senders().subscribe({
      next: (senders) => {
        if (senders.choices.length) {
          this.form.addControl(EMAIL_SENDER_KEY, new FormControl(senders.choices[0].address, { nonNullable: true }));
        }

        this.senders.set(senders);
      },
      error: () => this.sendersFailed.set(true)
    });

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

  /**
   * Whether the preview is the whole designed email (#3114): on Texas A&M's site, for an email whose design the API gave.
   * It is drawn in a sandboxed frame, since Angular's sanitiser takes out the inline styles the design is made of.
   */
  public isDesigned(group: ReviewEmailPreview['groups'][number]): boolean {
    return !!group.design && hasEmailDesign(this.site);
  }

  /**
   * The whole email as the first of a kind would get it, in the design, from the same function the API sends it with,
   * signed as the sender chosen in the box (#3114). Trusted for the frame's `srcdoc`: it is made by the site's own code,
   * whose Markdown shows typed HTML as text, and the frame is sandboxed, so nothing in it runs.
   */
  public designedHtml(group: ReviewEmailPreview['groups'][number]): SafeHtml {
    const subject = this.editableSubject ? this.exampleSubject(group.kind, group.example.values) : group.subject;

    return this.sanitizer.bypassSecurityTrustHtml(
      siteEmailHtml(this.example(group.kind, group.example.values), {
        site: this.site,
        subject,
        from: this.chosenSender()?.from ?? null,
        design: group.design
      })
    );
  }

  /** The subject as the first of a kind would get it, from the subject as it now stands (#3023). */
  public exampleSubject(kind: string, values: Record<string, string>): string {
    return fillReviewEmail(this.form.controls[`${kind}:subject`]?.value ?? '', values);
  }

  /** The sender chosen in the box, or none when there was nothing to choose: the site's, as before. */
  public chosenSender(): EmailSenderChoice | undefined {
    const address = this.form.controls[EMAIL_SENDER_KEY]?.value;

    return this.senders()?.choices.find((choice) => choice.address === address);
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
