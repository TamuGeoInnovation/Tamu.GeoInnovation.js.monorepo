import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  EMAIL_RECIPIENTS_KEY,
  EMAIL_SENDER_KEY,
  EMAIL_TOGETHER_KEY,
  EmailRecipient,
  EmailSenderChoice,
  EmailSenderChoices,
  FIRST_NAME_PLACEHOLDER,
  REVIEW_EMAIL_PLACEHOLDERS,
  alphabetical,
  emailHtml,
  fillReviewEmail,
  hasEmailDesign,
  joinNames,
  notSentFirst,
  sendsDetail,
  sendsLine,
  siteEmailHtml,
  togetherFirstNames,
  togetherTo,
  wasSent
} from '@tamu-gisc/gisday/common';
import { ContactService, ReviewEmailPreview } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  ButtonComponent,
  CheckboxComponent,
  CheckboxGroupComponent,
  RadioGroupComponent,
  SelectComponent,
  TextboxComponent
} from '@tamu-gisc/ui-kits/ngx/forms';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { GISDAY_SITE } from '../../../site/site';
import { serverMessage } from '../../../utils/server-message';

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
 * `EMAIL_SENDER_KEY` (#3100), or `null` when nothing is to be sent. A speaker email that listed its speakers (#3104) also
 * closes with those ticked under `EMAIL_RECIPIENTS_KEY`, and `EMAIL_TOGETHER_KEY` when they get one email together.
 */
export type ReviewEmailModalResult = Record<string, string> | null;

/** One email to all the speakers ticked, or a copy each (#3104). */
type How = 'together' | 'each';

/** A group's example, as the window shows it: who it is to, and the placeholders' values. */
type Example = ReviewEmailPreview['groups'][number]['example'];

/**
 * Shows the email a review sends before it is sent (#2981): one box per kind of email in the selection (accepted
 * posters, accepted presentations, rejections), each editable, with a preview filled in for the first submission of that
 * kind. Nothing is decided or sent until **Send**.
 *
 * Its **Send as** box (#3100) offers the addresses the API says the admin may send as, their own first and chosen, and the
 * preview shows the From recipients will see. With no choice to offer, the email goes from the site, as before.
 *
 * A speaker email lists its speakers (#3104), each with a tick box, all ticked to start. With more than one ticked it
 * offers **one email to all of them together**, the default, or **a copy each**, unless the preview says why it may only
 * go as a copy each (the profile email, whose every copy carries its speaker's own link). Together, the preview shows
 * every address on To and `{first name}` naming them all, as it will be sent.
 */
@Component({
  selector: 'tamu-gisc-review-email-modal',
  templateUrl: './review-email-modal.component.html',
  styleUrls: ['./review-email-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    RadioGroupComponent,
    SelectComponent,
    TextboxComponent
  ]
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
  /**
   * What to say when the email could not be loaded, after "nothing was sent", else null: the API's own reason for a refusal
   * (a 4xx, such as a session with no speakers), as the other admin pages give it, or to try again (#3189).
   */
  public readonly failed = signal<string | null>(null);
  public readonly form = new FormGroup<Record<string, FormControl<string>>>({});
  /** The form's key for the "Send as" box (#3100). */
  public readonly senderKey = EMAIL_SENDER_KEY;
  /** Who the admin may send as, from the API (#3100). */
  public readonly senders = signal<EmailSenderChoices | null>(null);
  public readonly sendersFailed = signal(false);
  /** The speakers ticked, by id (#3104): every one listed, to start. */
  public readonly chosen = new FormControl<Array<string>>([], { nonNullable: true });
  /** Together or a copy each (#3104): together to start, when it may go together. */
  public readonly how = new FormControl<How>('together', { nonNullable: true });
  /** The two as signals, so the window, which is checked only when told, redraws as they change. */
  private readonly chosenNow = toSignal(this.chosen.valueChanges, { initialValue: this.chosen.value });
  private readonly howNow = toSignal(this.how.valueChanges, { initialValue: this.how.value });
  /** Whether those not yet sent this email are listed first (#3167); by last name alone to start. */
  public readonly notSentFirst = new FormControl<boolean>(false, { nonNullable: true });
  private readonly notSentFirstNow = toSignal(this.notSentFirst.valueChanges, { initialValue: false });
  public readonly howOptions: Array<{ value: How; label: string }> = [
    { value: 'together', label: 'One email to all of them together' },
    { value: 'each', label: 'A copy each' }
  ];

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
      next: (given) => {
        // Listed alphabetically (#3142), whatever order the API gave; everything below follows this order.
        const preview = given.recipients ? { ...given, recipients: alphabetical(given.recipients) } : given;

        for (const group of preview.groups) {
          this.form.addControl(group.kind, new FormControl(group.template, { nonNullable: true }));

          if (this.editableSubject) {
            this.form.addControl(`${group.kind}:subject`, new FormControl(group.subject, { nonNullable: true }));
          }
        }

        // Every speaker ticked to start, and together unless it may only go as a copy each (#3104).
        this.chosen.setValue((preview.recipients ?? []).map((r) => r.guid));
        this.how.setValue(preview.copyEachReason ? 'each' : 'together');
        this.preview.set(preview);
      },
      error: (err) => this.failed.set(serverMessage(err, 'Please try again.'))
    });
  }

  /** Whether the email lists its speakers to tick (#3104); the review emails do not. */
  public listsRecipients(): boolean {
    return !!this.preview()?.recipients?.length;
  }

  /** The speakers ticked, in the order listed (#3104). */
  public ticked(): Array<EmailRecipient> {
    const chosen = this.chosenNow();

    return (this.preview()?.recipients ?? []).filter((r) => chosen.includes(r.guid));
  }

  /** Whether every speaker listed is ticked, so Select all shows ticked (#3142). */
  public allTicked(): boolean {
    const listed = this.preview()?.recipients ?? [];

    return listed.length > 0 && this.ticked().length === listed.length;
  }

  /** Select all (#3142): with everyone ticked, unticks everyone; otherwise ticks everyone, in the order listed. */
  public toggleAll(): void {
    this.chosen.setValue(this.allTicked() ? [] : (this.preview()?.recipients ?? []).map((r) => r.guid));
  }

  /**
   * The speakers as listed (#3167): by last name, or with those not yet sent this email first when chosen, each part by
   * last name.
   */
  public listed(): Array<EmailRecipient> {
    const recipients = this.preview()?.recipients ?? [];

    return this.notSentFirstNow() ? notSentFirst(recipients) : recipients;
  }

  /** Whether the API said what each speaker was sent before (#3167), so the window can show it and choose by it. */
  public knowsSends(): boolean {
    return (this.preview()?.recipients ?? []).some((r) => !!r.sends);
  }

  /** How many listed were never sent this email (#3167). */
  public notYetSentCount(): number {
    return (this.preview()?.recipients ?? []).filter((r) => !wasSent(r)).length;
  }

  /** Ticks only those never sent this email (#3167), and none of those who were. */
  public tickNotYetSent(): void {
    this.chosen.setValue(this.listed().filter((r) => !wasSent(r)).map((r) => r.guid));
  }

  /** A speaker's line under their name: their address, and whether and when they were sent this email (#3167). */
  public descriptionOf(recipient: EmailRecipient): string {
    const line = sendsLine(recipient);

    return line ? `${recipient.email} · ${line}` : recipient.email;
  }

  /** Every email a speaker was sent, newest first (#3167), for the list of who was sent what. */
  public historyOf(recipient: EmailRecipient): Array<string> {
    return sendsDetail(recipient);
  }

  /** Whether to offer together or a copy each: more than one ticked, and nothing to stop it going together (#3104). */
  public offersTogether(): boolean {
    return this.listsRecipients() && !this.preview()?.copyEachReason && this.ticked().length > 1;
  }

  /** Whether it goes as one email to all those ticked (#3104). */
  public together(): boolean {
    return this.offersTogether() && this.howNow() === 'together';
  }

  /**
   * Who the preview is for, and what it fills in (#3104): together, every ticked address on To and `{first name}` naming
   * them all; a copy each, the first ticked. As the API gave it for an email that lists no speakers.
   */
  public exampleOf(group: { example: Example }): Example {
    const ticked = this.ticked();

    if (!this.listsRecipients() || ticked.length === 0) {
      return group.example;
    }

    const shown = this.together() ? ticked : ticked.slice(0, 1);

    return {
      title: joinNames(shown.map((r) => r.name)),
      to: togetherTo(shown),
      cc: '',
      values: { ...group.example.values, [FIRST_NAME_PLACEHOLDER]: togetherFirstNames(shown) }
    };
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
   * The whole email as the example shown would get it (the first ticked, or all of them together, #3104), in the design,
   * from the same function the API sends it with, signed as the sender chosen in the box (#3114). Trusted for the
   * frame's `srcdoc`: it is made by the site's own code, whose Markdown shows typed HTML as text, and the frame is
   * sandboxed, so nothing in it runs.
   */
  public designedHtml(group: ReviewEmailPreview['groups'][number]): SafeHtml {
    const { values } = this.exampleOf(group);
    const subject = this.editableSubject ? this.exampleSubject(group.kind, values) : group.subject;

    return this.sanitizer.bypassSecurityTrustHtml(
      siteEmailHtml(this.example(group.kind, values), {
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

  /** How many emails a group sends: one together, one per speaker ticked (#3104), or as many as the API counted. */
  public count(group: { count: number }): number {
    if (!this.listsRecipients()) {
      return group.count;
    }

    return this.together() ? 1 : this.ticked().length;
  }

  public total(preview: ReviewEmailPreview): number {
    return preview.groups.reduce((sum, group) => sum + this.count(group), 0);
  }

  public send() {
    const result: Record<string, string> = this.form.getRawValue();

    // Those ticked, and together when chosen (#3104); with no one ticked there is no one to send it to.
    if (this.listsRecipients()) {
      const ticked = this.ticked();

      if (ticked.length === 0) {
        return;
      }

      result[EMAIL_RECIPIENTS_KEY] = ticked.map((r) => r.guid).join(',');

      if (this.together()) {
        result[EMAIL_TOGETHER_KEY] = 'true';
      }
    }

    this.mr.close(result);
  }

  public cancel() {
    this.mr.close(null);
  }
}
